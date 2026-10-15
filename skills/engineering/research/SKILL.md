---
name: research
description: Research topics and docs/API facts, or explore code locations, behavior, call paths, and implementation differences.
---

# Research

## Delegation

Launch a **background agent** with the question, context, scope, constraints, and expected deliverable. Continue independent work while it investigates; incorporate its findings once returned.

## Research contract

- **Evidence:** use primary sources relevant to the implementation or version. Cite local evidence as `path:line` and link external sources; distinguish findings from inference and disclose conflicting evidence or gaps. A failed search is not proof of absence.
- **Scope:** choose methods, reading order, and depth to fit the question. Expand only to answer it or resolve uncertainty; stop when every scoped question has a supported answer or an explicit evidence gap.
- **Read-only:** no implementation changes, installs, or commits. A requested report is the only permitted write.
- **Delivery:** return concise findings in chat by default. Save a report only when requested, using the requested location or the repo's notes convention, and return its path.
