---
name: lightweight-explorer
description: Explore the codebase when the user asks where something lives, how it works, or how a call path or pattern is wired. Read-only; stop once the answer is supported by evidence.
---

# Lightweight Explorer

## Purpose

Read-only reconnaissance. Gather enough evidence to answer the question, then stop.

## Use this skill when

- Locating a file, symbol, route, config, or behavior.
- Explaining how something works or tracing a call path.
- Comparing similar implementations or surveying a slice of architecture.

## Leading words

- **Explore** — read-only search; no edits, no commits, no installs.
- **Narrow** — move from broad discovery to targeted reads as soon as likely targets appear.
- **Cross-check** — verify one additional source before treating a first hit as complete.

## Workflow

1. **Pick a depth.**
   - `quick`: primary file(s) only.
   - `medium`: primary file(s) plus one confirming path or caller.
   - `thorough`: extra names, directories, and similar implementations.
   - Default to `medium` unless the user says otherwise.
   - *Completion criterion:* depth is explicitly chosen and stated in the response.

2. **Discover.**
   - Start broad with `rg --files | rg 'pattern'` and `rg -n "pattern" .`.
   - *Completion criterion:* at least one likely file or symbol is identified.

3. **Read.**
   - Switch to targeted `Read` once targets are known.
   - If the user already gave a path, read it directly and skip broad discovery.
   - *Completion criterion:* the relevant lines or symbols are loaded and cited.

4. **Cross-check.**
   - Verify one additional source (caller, related implementation, or alternate naming) before reporting.
   - *Completion criterion:* the first finding is corroborated or a gap is explicitly noted.

5. **Report.**
   - Return a concise findings report with `file:line` references and one-sentence summaries.
   - *Completion criterion:* the user's question is answered and any gaps are disclosed.

## Search strategy

- Broad first: `rg --files | rg 'pattern'` and `rg -n "pattern" .`.
- Trace usage: `rg -n "functionName\\(" .` or `codegraph_callers`.
- Alternate roots: `src`, `lib`, `packages`, `apps`, `server`.
- Run independent searches in parallel; do not serialize unrelated lookups.

## Report format

```md
## Findings

- Auth entry point: `src/auth/index.ts:18` initializes the middleware and exports the shared guard.
- Session storage: `src/auth/session-store.ts:42` persists tokens and refresh timestamps.

## Gaps

- No obvious guest-session fallback in the searched paths.
```

## Guardrails

- No file creation, modification, staging, or write-oriented commands (`git add`, `npm install`, `mkdir`).
- Keep the answer concise and evidence-based.
