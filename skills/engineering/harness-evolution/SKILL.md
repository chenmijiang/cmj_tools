---
name: harness-evolution
description: "Use for agent session retrospectives or evaluating and improving agent memory, instructions, skills, and harness behavior."
disable-model-invocation: true
---

Learn from agent experience and improve the environment for future work. No persistent change is a valid outcome.

## Scope and authority

Start with the user's target and desired outcome: a session, a specific memory or constraint, a recurring problem, or a proposed change. A retrospective without a specified target means the current session. Inspect only evidence and consumers needed to decide that question; widen scope only for an evidenced dependency or risk, and state the reason. A targeted request is not a whole-harness or memory-bank audit.

Analysis is read-only. Implement only within the user's authorization. Global behavior changes, cross-project effects, and irreversible actions require explicit approval. This skill grants no additional authority.

## 1. Learn from experience

Look for salient successes, failures, corrections, or discoveries relevant to the target. A single experience can yield a useful insight; recurrence is evidence of importance, not a prerequisite. Record the conditions under which an observed result held and any untested boundary rather than treating success as a universal rule.

Trace candidates to primary evidence such as user decisions, workspace state, session events, and tool outputs. Separate what happened from explanations and hypotheses. A transcript or memory records what was said or observed; it does not establish that the conclusion is correct. When prior knowledge matters, check relevant memories against their sources and current state; an incomplete search is not a complete inventory.

## 2. Trace the leverage point

Investigate the relevant information and execution path, including navigation, tools, checks, instructions, skills, memory, context, and human decisions only as needed. For a retrospective, inspect existing checks and their integration when they bear on the outcome. Distinguish an execution mistake from an environment gap; do not infer recurrence or causation from a single example.

When a specific instruction, memory, skill, or other context is implicated, trace its path to the target consumer: identify the consumer, the loading or retrieval mechanism and conditions, whether it was actually delivered, and evidence of its effect on the task. A file's existence does not prove it was loaded; delivery does not prove behavioral influence. Use the available runtime trace, configuration, or implementation evidence; report each unobserved link as unknown and stop once the target question is answered or blocked.

## 3. Choose the intervention

Compare no persistent change, fixing the source or existing mechanism, revising existing knowledge or guidance, and adding a new one. Choose by evidence, future utility, scope, and cost of use and maintenance; prefer one source of truth and identify material the change can replace or retire.

Choose both a home and availability: current task artifacts for transient state; code, tests, or project docs for current project behavior; scoped memory for durable context; skills for repeatable procedures; checks or enforcement for mechanical invariants; narrow standing instructions for necessary guidance. Decide whether the consumer needs it always, on demand, or only for this task, based on the traced path.

## 4. Verify the learning

Present findings by importance with evidence, judgment, proposed action and scope. For a consequential change, name the expected difference in a future task and a proportionate observation or comparison that could disprove it; include cost and reversal where material.

If implementation is authorized, inspect the target and consumers before editing. Read a memory's full content before replacing it and use supported operations; report an uneditable record rather than claiming it was corrected. Verify the artifact and, where feasible, its consuming behavior. Report observed results and untested links. Revisit consequential assumptions when models, tools, or the task environment materially change.
