Generate ONE commit message in Conventional Commits style.

## Output

- Return ONLY the final commit message.
- Do NOT add markdown, code fences, labels, or explanations.
- Format:

```text
<type>(<scope>): <description>

<body>

<footer>
```

- `scope`, `body`, and `footer` are optional.
- Add blank lines only when `body` or `footer` exists.

## Decision Order

1. Find the `PRIMARY intent` of the diff.
2. Choose the most specific `type`.
3. Add `scope` only if one area clearly dominates.
4. Write a short, concrete `description`.
5. Add `body` only for non-obvious WHY, IMPACT, or RISK.
6. Add `!` and `BREAKING CHANGE:` only for real breaking changes.

## Key Terms

- `PRIMARY intent`: main outcome of the diff, not file type or implementation detail.
- `Observable behavior`: anything users, API consumers, operators, or developers will notice.
- `scope`: the main module, directory, or feature area.
- `imperative mood`: `add`, `fix`, `remove`, not `added`, `fixed`, `removes`.

## Type Selection

- `feat`: adds behavior or capability
- `fix`: corrects broken behavior
- `perf`: improves performance without changing intended behavior
- `refactor`: restructures code without behavior change
- `docs`: docs/comments/examples only
- `test`: tests only
- `style`: formatting/lint/whitespace only
- `build`: build, packaging, dependencies, artifacts
- `ci`: CI or release automation only
- `chore`: maintenance with no better type
- `revert`: reverts a previous commit

Tie-breakers:

- behavior added + refactor => `feat`
- behavior fixed + refactor => `fix`
- performance improved via refactor => `perf`
- docs/tests plus real code change => use the real code-change type
- dependency/tooling change that fixes runtime behavior => `fix`; otherwise `build` or `chore`
- avoid `chore` when a specific type fits

## Scope Rules

- Use a short noun such as `auth`, `api`, `ui`, `rules`.
- Omit `scope` for cross-cutting or repo-wide changes.
- Do NOT invent a scope just to fill the format.

## Description Rules

- one line
- preferably 50 characters or fewer
- imperative mood
- lowercase first letter
- no trailing period
- describe the result, not the implementation steps

Prefer concrete wording: `verb + object + outcome`

Avoid vague summaries:

- `fix bug`
- `update code`
- `make changes`
- `improve stuff`

## Body And Footer

- Default: omit the `body`.
- Add a `body` only when the subject alone is not enough.
- Keep `body` to 1-2 short lines.
- Explain WHY, IMPACT, CONTEXT, or RISK.
- Do NOT list files, functions, or implementation steps.
- Use `footer` only for structured info, especially breaking changes.

Breaking change format:

```text
feat(api)!: rename userId to accountId

BREAKING CHANGE: clients must send accountId instead of userId.
```

## Hard Bans

- NEVER mention AI generation.
- NEVER output multiple options.
- NEVER add commentary before or after the message.
- NEVER choose `type` from file extension alone.
- NEVER force `scope`, `body`, or `footer`.
