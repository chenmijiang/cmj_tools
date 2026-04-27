---
name: lightweight-explorer
description: Use when the task is read-only codebase exploration, such as locating files, symbols, or implementations; tracing entry points or call paths; surveying project structure; comparing similar patterns; or answering where and how something works before making edits.
---

# Lightweight Explorer

## Overview

Treat exploration as a read-only reconnaissance pass. Gather enough evidence to answer the question quickly, then stop. Favor high-signal, low-cost commands and avoid unnecessary context, edits, installs, or implementation work.

## Use This Skill When

- User asks where a file, function, route, config, or behavior lives
- User wants a quick architecture survey or concise explanation of how something works
- User wants a similar implementation or a multi-file trace of a feature, module, or call path

## Do Not Use It When

- Task requires editing files, generating code, or committing changes
- Task depends on running builds, tests, or installers
- User needs a full implementation plan instead of focused code search

## Workflow

1. Start broad with cheap discovery commands such as `rg --files` and `rg -n`.
2. Narrow fast. Once you have likely files, switch to targeted reads.
3. Cross-check once if the first hit may be incomplete.
4. Return a short findings report with paths, line references, and one-sentence summaries.

## Search Strategy

Start broad when location is unknown. Prefer `rg` and `rg --files` for discovery because they are fast and scale well.

```bash
rg --files | rg 'auth|login|session'
rg -n "createSession|AUTH_TOKEN|login" src app lib
rg -n "retry|backoff|timeout" .
```

Once you have likely targets, switch to direct reads. If the user already provided the file path, read it directly instead of searching first.

```bash
sed -n '120,220p' path/to/file.ts
nl -ba path/to/file.ts | sed -n '120,220p'
```

If the first search misses, try alternate naming styles, shift the root (`src`, `lib`, `packages`, `apps`, `server`), search a broader concept, and check both implementation sites and call sites.

## Parallelism And Depth

- Default to `medium`. Use `quick` to stop at the primary files and `thorough` to check extra names, directories, and similar implementations.
- Run independent searches in parallel when they do not depend on each other
- Avoid serializing unrelated searches when one result does not affect the next step

## Preferred Commands

| Goal                         | Command                                    | Why                                     |
| ---------------------------- | ------------------------------------------ | --------------------------------------- | ----------------------------------------- |
| Find files by name or path   | `rg --files                                | rg 'pattern'`                           | Prefer over `find` for normal code search |
| Find symbols or text         | `rg -n "pattern" path/`                    | Use multiple likely terms when needed   |
| Trace callers or usage       | `rg -n "functionName\\(" .`                | Search call sites, not just definitions |
| Inspect or cite a file range | `sed -n 'start,endp' file` or `nl -ba file | sed -n 'start,endp'`                    | Switch to precise reads once narrowed     |

## Report Format

Return a concise report that is easy to scan.

```md
## Findings

- Auth entry point: `src/auth/index.ts:18` initializes the middleware and exports the shared guard.
- Session storage: `src/auth/session-store.ts:42` persists tokens and refresh timestamps.

## Gaps

- No obvious handler for guest-session fallback in the searched paths.
```

## Common Mistakes

- Reading too many files before narrowing the search
- Trusting the first match without one cross-check
- Using slower broad commands when `rg` would do the job
- Dumping raw command output instead of reporting findings

## Guardrails

- Do not create files, including temporary scratch files
- Do not modify files or stage changes
- Do not run write-oriented commands such as `git add`, `git commit`, `npm install`, or `mkdir`
- Keep the answer concise and evidence-based
