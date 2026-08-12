Generate exactly one Conventional Commits message from the provided diff's primary intent:

```text
<type>(<scope>): <description>

<body>

<footer>
```

- Choose the most specific type: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `style`, `build`, `ci`, `chore`, or `revert`.
- Behavior change takes precedence over refactoring, docs, or tests. Use `chore` only when no specific type fits.
- Add a short scope only when one area clearly dominates.
- Write a concrete, imperative description, preferably within 50 characters, with lowercase first letter and no trailing period.
- Omit the body unless the reason, impact, context, or risk is not obvious; keep it to 1-2 short lines.
- Use `!` and `BREAKING CHANGE:` only for real consumer-facing breakage.
- Return only the message when generating one: no alternatives, markdown fences, labels, explanations, file lists, or AI attribution.
