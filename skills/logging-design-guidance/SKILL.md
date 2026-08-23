---
name: logging-design-guidance
description: Decide whether an event is worth logging before adding or changing application logs, using operational value and runtime context rather than log presence alone.
---

# Logging design guidance

This skill is the decision point for determining whether an application log should exist.

## Decision flow

1. Determine the execution context with `runtime-aware-logging`.
2. Evaluate `when-to-log` to identify events with meaningful operational value.
3. Evaluate `when-not-to-log` to identify events that should remain unlogged.
4. If logging is justified, apply `context` to determine the smallest useful amount of safe context.
5. Apply `identifiers-and-uuids` when the event needs an identifier, entity identity, operation identity, or correlation context.
6. Apply `traceability` when related events must remain correlatable across observable components, processes, systems, or SDK boundaries.
7. Apply `log-levels` to determine the semantic level of an existing or proposed log within the observable operation.
<<<<<<< HEAD
8. Apply `log-frequency` when the event can execute repeatedly or at high frequency.
9. Apply the specialized LogCraft rules for sensitive output, runtime, and CI/CD context.
=======
8. Apply `duration-and-performance` when timing information could help monitor an operation, understand execution behavior, or investigate possible bottlenecks or regressions.
9. Apply the specialized LogCraft rules for frequency, sensitive output, runtime, and CI/CD context.
>>>>>>> 634240c (Register duration and performance guidance)

The two decision rules are complementary: an event may look important enough to log, but still be better left unlogged because it is duplicated, excessively frequent, temporary, sensitive, or better represented by another observability mechanism.

## Rules

- [`when-to-log`](rules/when-to-log.md) — determine whether an event has enough operational value to justify a log and what makes the event meaningful.
- [`when-not-to-log`](rules/when-not-to-log.md) — determine whether a log should explicitly be avoided and explain why.
- [`context`](rules/context.md) — evaluate who, what, where, and when; distinguish macro operational context from micro diagnostic context; and use event-specific context with existing identifiers without inventing or exposing sensitive values.
- [`identifiers-and-uuids`](rules/identifiers-and-uuids.md) — choose the most atomic meaningful identifier, evaluate composite identifiers, and use UUIDs only when a suitable identity or correlation mechanism does not already exist.
- [`traceability`](rules/traceability.md) — evaluate whether related events remain correlatable across the observable portion of an operation and identify evidence-based breaks in that relationship.
- [`log-levels`](rules/log-levels.md) — choose DEBUG, INFO, WARN, or ERROR according to operational meaning, operation outcome, available levels, and observable context.
<<<<<<< HEAD
- [`log-frequency`](rules/log-frequency.md) — evaluate repeated logs according to their level, information value, repetition cause, observable unit, and evidence of runtime amplification.
=======
- [`duration-and-performance`](rules/duration-and-performance.md) — determine when duration information can provide operational value, how to recommend measurement granularity, and how to account for existing observability, frequency, overhead, and asynchronous execution.
>>>>>>> 634240c (Register duration and performance guidance)

## Interaction with other LogCraft guidance

Use the specialized rules after the initial logging decision:

- Use `runtime-aware-logging` to classify where the event executes.
- Use `context` when determining whether a justified log has enough useful context to explain why it exists and what happened.
- Use `log-frequency` when repetition or execution frequency can create excessive output without sufficient information value.
- Use `secret-safe-output` when the event or its context may expose sensitive data.
- Use `verbose-output` for permanently enabled diagnostic/verbose command output.
- Use `ci-context-rich-output` and `github-actions-summary` for CI/CD-specific output decisions.
- Use `identifiers-and-uuids` when choosing how an event, entity, operation, or execution should be identified.
- Use `traceability` when evaluating whether related events can be followed through observable boundaries.
- Use `log-levels` when evaluating whether the selected level accurately represents the operational meaning of the event.
- Use `duration-and-performance` when timing information may help understand execution behavior or investigate performance.

A specialized rule may change the recommendation after this initial decision.

## Agent behavior

When reviewing or modifying code:

1. Identify the event and its runtime context.
2. Evaluate both logging decision rules.
3. If logging is justified, apply `context` and recommend the smallest useful amount of safe context.
4. Apply `identifiers-and-uuids` when an identifier is relevant to the event.
5. Apply `traceability` when the event belongs to an operation that crosses or may cross observable boundaries.
6. Apply `log-levels` to evaluate the semantic level of the event using the project's actual logging capabilities.
7. Apply `duration-and-performance` when timing could answer a meaningful operational question, and explain the evidence and trade-offs behind the recommendation.
8. If logging is not justified, explain what makes it noise and what alternative, if any, would better serve the use case.
9. Apply specialized rules before finalizing the recommendation.

Do not recommend adding a log just to make code more observable in the abstract. Explain the operational question the log is intended to answer.
