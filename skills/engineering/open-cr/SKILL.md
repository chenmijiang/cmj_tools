---
name: open-cr
description: Review workspace, branch/range, or commit changes through Open Code Review delegation. Use when OCR should select files and resolve rules while the host agent reviews or fixes the code without an OCR-side LLM.
compatibility: Requires `ocr delegate preview` and `ocr delegate rule` with JSON output.
license: Apache-2.0
metadata:
  author: alibaba
  homepage: https://github.com/alibaba/open-code-review
  version: "1.0.0"
---

# Open Code Review

OCR selects files and resolves their rules. The host agent gathers the code evidence, reviews it, and optionally applies fixes.

## Workflow

1. **Scope.** Choose exactly one mode: no mode flags for workspace changes, both `--from` and `--to` for a range, or `--commit` for one commit. Add `--repo`, `--rule`, `--exclude`, or one background flag only when needed:

   ```bash
   ocr delegate preview --format json
   ocr delegate preview --format json --from <ref> --to <ref>
   ocr delegate preview --format json --commit <hash>
   ```

   Record the mode/ref metadata, background, excluded files, and every `(path, status)` in `reviewable_files`. `--background-file` takes precedence when both background flags are passed, so pass only one. The `(path, status)` pair is the identity because workspace mode can contain a staged deletion and untracked recreation at the same path. Scope is complete when the resolved mode and background match the request and every preview entry has a checklist item.

2. **Rules.** Resolve all reviewable paths together:

   ```bash
   ocr delegate rule --format json <path...>
   ```

   Repeat applicable `--repo` and `--rule` flags so both commands resolve the same repository and rule chain. The output groups files that share rule content. Map every checklist item to its rule group before reviewing; fetch bounded batches only when the argument list or output is too large.

3. **Evidence.** Read enough surrounding code and obtain each change from the preview metadata:

   | Mode                 | Evidence                                |
   | -------------------- | --------------------------------------- |
   | Range                | `git diff <merge_base>..<to> -- <path>` |
   | Commit               | `git show <commit> -- <path>`           |
   | Workspace, tracked   | `git diff HEAD -- <path>`               |
   | Workspace, untracked | Read the whole file                     |

   Review behavior, security, correctness, performance, maintainability, and tests against the resolved rules and supplied requirements. Continue after the first finding. Mark each checklist item `reviewed` or `skipped` with a concrete reason.

4. **Coverage.** Before reporting, account for every reviewable entry. Report `total_files`, `reviewable_count`, `reviewed_files`, `skipped_files`, and `coverage_rate = (reviewed_files + skipped_files) / reviewable_count`; use `100%` when `reviewable_count` is zero and list every skip reason. Excluded files are outside review coverage.

5. **Findings.** Report only actionable, evidence-backed issues, ordered by severity. Discard likely false positives and low-value style remarks. Each finding uses:

   | Field                    | Required | Value                                                                                             |
   | ------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
   | `path`                   | yes      | Repository-relative path                                                                          |
   | `content`                | yes      | Problem, impact, and concrete correction                                                          |
   | `start_line`, `end_line` | no       | Lines in the new file                                                                             |
   | `category`               | no       | `bug`, `security`, `performance`, `maintainability`, `test`, `style`, `documentation`, or `other` |
   | `severity`               | no       | `critical`, `high`, `medium`, or `low`                                                            |

   Critical/high findings cover exploitable behavior, incorrect results, crashes, or data loss. Medium findings cover credible performance, error-handling, test, or maintenance risks. Include low findings only when the correction is clearly worth the review noise.

6. **Fix when requested.** Apply confirmed findings within the user's requested scope, then run checks that exercise the changed behavior. Report unresolved findings with their blocker; do not silently convert them into fixes or omissions.

## Recovery

- **Oversized `--background-file`:** Preserve its requirements, constraints, and acceptance criteria in a summary within the limits reported by OCR. Retry with the summary through a shell-safe argument or bounded file, omitting the original file. If faithful summarization is impossible, omit OCR background and read the source directly during review.
- **Command failure:** A nonzero exit invalidates that step. Report the exact error instead of inferring missing scope or rule data.

Use `ocr delegate preview --help` and `ocr delegate rule --help` for the current flag reference.
