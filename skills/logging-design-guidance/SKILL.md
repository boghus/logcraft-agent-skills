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
4. If logging is justified, recommend the smallest useful amount of safe context.
5. Apply `identifiers-and-uuids` when the event needs an identifier, entity identity, operation identity, or correlation context.
6. Apply the specialized LogCraft rules for frequency, sensitive output, runtime, and CI/CD context.

The two decision rules are complementary: an event may look important enough to log, but still be better left unlogged because it is duplicated, excessively frequent, temporary, sensitive, or better represented by another observability mechanism.

## Rules

- [`when-to-log`](rules/when-to-log.md) — determine whether an event has enough operational value to justify a log and what makes the event meaningful.
- [`when-not-to-log`](rules/when-not-to-log.md) — determine whether a log should explicitly be avoided and explain why.
- [`identifiers-and-uuids`](rules/identifiers-and-uuids.md) — choose the most atomic meaningful identifier, evaluate composite identifiers, and use UUIDs only when a suitable identity or correlation mechanism does not already exist.

## Interaction with other LogCraft guidance

Use the specialized rules after the initial logging decision:

- Use `runtime-aware-logging` to classify where the event executes.
- Use `log-amplification` when frequency or repeated execution can create excessive output.
- Use `secret-safe-output` when the event or its context may expose sensitive data.
- Use `verbose-output` for permanently enabled diagnostic/verbose command output.
- Use `ci-context-rich-output` and `github-actions-summary` for CI/CD-specific output decisions.
- Use `identifiers-and-uuids` when choosing how an event, entity, operation, or execution should be identified.

A specialized rule may change the recommendation after this initial decision.

## Agent behavior

When reviewing or modifying code:

1. Identify the event and its runtime context.
2. Evaluate both logging decision rules.
3. If logging is justified, recommend the smallest useful amount of safe context.
4. Apply `identifiers-and-uuids` when an identifier is relevant to the event.
5. If logging is not justified, explain what makes it noise and what alternative, if any, would better serve the use case.
6. Apply specialized rules before finalizing the recommendation.

Do not recommend adding a log just to make code more observable in the abstract. Explain the operational question the log is intended to answer.
