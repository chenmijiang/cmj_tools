Generate commit messages following Conventional Commits format.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type

Choose exactly one type based on the PRIMARY intent of the diff, not the file extension, not the number of files, and not the implementation technique.

Use this decision order:

- `feat`: adds new user-visible behavior, API, CLI option, config capability, workflow, or output shape
- `fix`: corrects broken behavior, regression, crash, wrong result, validation bug, or compatibility issue
- `perf`: improves latency, throughput, memory, bundle size, or query cost without changing product behavior
- `refactor`: restructures code without changing observable behavior and without performance as the primary goal
- `test`: adds or updates tests only
- `docs`: adds or updates docs, comments, or examples only
- `style`: formatting, lint-only, or whitespace-only changes with zero semantic impact
- `ci`: CI workflows, release automation, or pipeline config only
- `chore`: maintenance that does not fit above, such as dependency bumps, repo config, or generated files

Tie-breakers:

- If the diff both refactors and fixes behavior, use `fix`
- If the diff both refactors and adds behavior, use `feat`
- If a dependency or tooling change fixes runtime behavior, use `fix`; otherwise use `chore`
- Avoid `chore` when any more specific type applies

## Subject

- Max 50 chars, imperative mood, lowercase first letter, no period
- Reference concrete identifiers from diff (function names, file names, module names)
- NEVER: "update code", "fix bug", "make changes", "minor updates"

## Body

- Default: empty. Most commits need only a subject line.
- Include ONLY when:
  - Multi-file changes need relation explained
  - Breaking change needs migration notes
  - Reason for change is not obvious from diff
- Explain WHY or IMPACT, never restate WHAT the diff already shows
- Prefer 1 line; max 2 lines; never 3
- Each line must carry exactly one non-obvious point:
  - motivation or constraint
  - cross-file impact or relation
  - migration or operational note
- Omit the body if it starts listing files, functions, or implementation steps

## Scope

- Use module or directory name: `auth`, `api`, `ui`
- Omit for cross-module changes

## Breaking Change

- Add `!` after type/scope: `feat(api)!: restructure response format`
- Footer: `BREAKING CHANGE: description`

## Output

Return ONLY the commit message, no markdown code blocks, no explanations.

## Examples

```
docs(guide): add Python async programming guide
```

```
refactor(auth): extract token validation into middleware

Keep auth checks consistent across handlers.
```

```
feat(api)!: switch response envelope to JSON:API format

BREAKING CHANGE: response shape changed from {data, status} to {data, meta}.
```
