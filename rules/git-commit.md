Generate commit messages following Conventional Commits format.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

feat | fix | docs | style | refactor | perf | test | ci | chore

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
- Explain WHY, never WHAT the diff shows
- Max 3 lines

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

Move validation logic from route handlers to shared middleware.
Reduces duplication across 5 endpoint files.
```

```
feat(api)!: switch response envelope to JSON:API format

BREAKING CHANGE: response shape changed from {data, status} to {data, meta}.
```
