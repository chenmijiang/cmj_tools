---
name: retro
description: "Conduct a retrospective on a coding session."
disable-model-invocation: true
---

Suggest evidence-backed improvements to the coding agent's environment for future sessions.

## Steps

1. Read `writing-for-agents` for guidance on agent-facing documents.
2. Read primary sources for the requested session (current session by default), including session logs as needed. Establish the evidence for each finding.
3. Assess each category below; retain candidates supported by session evidence or an inspected environment gap.
4. Present candidates by severity, each with evidence, impact, and a concrete change at the appropriate destination. Propose changes to files, tooling, or memory; apply them only when requested.

## Improvement categories

- **Navigation**: when finding information took too long, identify missing pointers or hidden file dependencies.
- **Automated checks**: inspect existing check commands, hooks, and CI first. Report missing, broken, or unwired guardrails, including the absence of any hook or CI job running checks. Route mechanically detectable mistakes to the cheapest deterministic check in the existing toolchain.
- **Coding standards**: when review missed a judgement call, clarify, add, or remove the relevant reviewer rule. Keep judgement calls (such as cross-file consistency) in `CODING_STANDARDS.md`; route mechanical violations to automated checks.
- **AGENTS.md**: when global or repo steering files are large, move review rules and mechanical constraints to their appropriate destinations.
- **Tool economy**: identify expensive calls or token-heavy tools whose cost could be reduced.
- **No-ops**: identify steering instructions that add load without changing agent behavior.
- **Information access**: when crucial evidence was unavailable, propose access such as dev-server logs or read-only service access.
- **Agent memory**: validate relevant long-term memories against primary sources; propose correcting stale or conflicting entries, narrowing overgeneralizations, and merging duplicates. Extract durable facts or lessons with evidence, scope, and conditions. Retain knowledge that future sessions would otherwise have to rediscover; keep repository lookups and transient session state in their existing sources.

## Destinations

- **`AGENTS.md` / `CLAUDE.md`**: keep always-loaded instructions minimal, primarily navigation pointers.
- **`CODING_STANDARDS.md`**: keep judgement-based standards with the reviewer to reduce implementation context pressure; point to supporting docs when lengthy.
- **Docs**: reuse existing reference material before adding more.
- **Skills**: package repeatable workflows or discoverable reference material; choose invocation using `writing-for-agents`.
- **Memory**: retain cross-session facts and lessons; route repeatable workflows to skills and mechanical constraints to automated checks.
