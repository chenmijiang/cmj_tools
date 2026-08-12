---
name: git-commit
description: Commit changes when the user asks in natural language or invokes /commit; also generate a Conventional Commits message when requested without committing.
---

# Git Commit

## Workflow

1. Inspect `git status`, staged and unstaged diffs, and identify the files changed by the current task.
2. If the user asked only for a message, generate exactly one message from the relevant diff and return it without changing Git state.
3. For a commit request, stage only current-task files. If a file mixes current-task work with pre-existing changes, ask the user how to proceed and stop.
4. Generate exactly one Conventional Commits message from the staged diff's primary intent:
   - Choose the most specific type: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `style`, `build`, `ci`, `chore`, or `revert`.
   - Prefer behavior change over refactoring, docs, or tests; use `chore` only when no specific type fits.
   - Add a short scope only when one area clearly dominates.
   - Write a concrete, imperative description, preferably within 50 characters, with lowercase first letter and no trailing period.
   - Add a 1-2 line body only when the reason, impact, context, or risk is not obvious.
   - Use `!` and `BREAKING CHANGE:` only for real consumer-facing breakage.
5. Commit immediately. The user's commit request is authorization for this task; message confirmation is unnecessary.
6. Report the commit hash and message. If Git hooks fail, report the failure and leave the resulting Git state unchanged.

Use `git commit -m "<subject>"` for a single-line message. For a multiline message, write it to a temporary file and use `git commit -F <file>` so newlines are preserved.

Stop without committing when no relevant changes exist or task-owned changes cannot be isolated safely.
