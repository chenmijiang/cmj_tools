---
name: git-commit
description: Use when a user asks to commit staged changes, requests a commit message for a staged diff, or invokes /commit.
---

# Git Commit

## Overview

Use this skill to turn a staged diff into one clear Conventional Commits message, show it plainly, and commit it safely after confirmation.

## When to Use

- User asks to commit staged changes
- User asks for a commit message for a staged diff
- `/commit` is invoked

## When Not to Use

- No staged changes exist
- Task is about unstaged changes only
- User asks about commit conventions in general
- User explicitly does not want a commit prepared

## Workflow

1. Run `git diff --cached`.
2. If the staged diff is empty, say there are no staged changes and stop.
3. Analyze the diff in this order:
   - find the `PRIMARY intent`: the main outcome of the diff, not file type or implementation detail
   - choose the most specific `type`
   - add `scope` only if one area clearly dominates
   - write a short, concrete `description`
   - add `body` only for non-obvious WHY, IMPACT, CONTEXT, or RISK
   - add `footer` only for structured info, especially breaking changes
   - add `!` and `BREAKING CHANGE:` only for real breaking changes
4. Generate exactly one commit message.
5. Present it plainly, ask for confirm, edit, or cancel, and commit only after confirmation.
6. Use `git commit -m "<subject>"` only for a single-line message; if `body` or `footer` exists, preserve newlines with `git commit -F <file>`.

## Selection Rules

- `feat`: adds behavior or capability
- `fix`: corrects broken behavior
- `perf`: improves performance without changing intended behavior
- `refactor`: restructures code without behavior change
- `docs`: docs, comments, or examples only
- `test`: tests only
- `style`: formatting, lint, or whitespace only
- `build`: build, packaging, dependencies, or artifacts
- `ci`: CI or release automation only
- `chore`: maintenance with no better type
- `revert`: reverts a previous commit
- behavior change beats refactor: add => `feat`, fix => `fix`, perf => `perf`
- docs/tests plus real code change => use the real code-change type
- dependency or tooling change that fixes runtime behavior => `fix`; otherwise `build` or `chore`
- avoid `chore` when a more specific type fits

## Message Rules

- Base format: `<type>(<scope>): <description>`
- `scope`, `body`, and `footer` are optional
- Use short scopes like `auth`, `api`, `ui`, `rules`; omit `scope` for cross-cutting or repo-wide changes
- Do not invent a scope just to fill the format
- `description` must be one line, preferably 50 characters or fewer
- Use imperative mood like `add`, `fix`, `remove`, start with lowercase, and do not end with a period
- Describe the result, not the implementation steps
- Avoid vague summaries like `fix bug`, `update code`, `make changes`
- Default: omit the `body`; if used, keep it to 1-2 short lines
- Do not restate the diff or list files, functions, or steps
- Use breaking markers only for real consumer-facing breakage

## Hard Bans

- Never mention AI generation
- Never output multiple options
- Never add markdown fences around the proposed message
- Never choose `type` from file extension alone
- Never force `scope`, `body`, or `footer`
- Never flatten a multiline message into one `-m` string
