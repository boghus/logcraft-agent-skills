---
name: logging-design-guidance
description: Decide whether an event is worth logging before adding or changing application logs, using operational value and runtime context rather than log presence alone.
---

# Logging design guidance

This skill is the decision point for determining whether an application log should exist and, when requested, for creating a log that follows the LogCraft principles.

## Commands

The skill supports two explicit modes:

### `analyze`

Analyze existing or proposed logging without modifying the code.

Use this mode when the agent needs to determine whether a log is justified, whether an existing log follows the guidance, or what should be improved.

The analysis must:

1. Identify the event and its runtime context.
2. Evaluate the applicable LogCraft rules.
3. Report findings with the relevant rule, severity, location or code context when available, problem, and concrete suggestion.
4. Distinguish between a justified log, a log that needs improvement, and a log that should not exist.
5. Explain the operational question the log should answer rather than recommending logging for observability in the abstract.

`analyze` is read-only: it must not modify application code.

### `create`

Create or modify application logging using the LogCraft principles, then validate the result by running the same analysis again.

The creation flow is:

```text
Understand context
    ↓
Determine whether a log should exist
    ↓
Apply applicable LogCraft rules
    ↓
Create or modify the log, or intentionally leave it unlogged
    ↓
Analyze the resulting code again
    ↓
PASS → finalize
FAIL/WARN → improve and analyze again
```

The `create` mode must not assume that every request requires a log. A valid result may be **no log**, when the rules determine that logging would create noise, duplicate existing observability, expose sensitive information, or otherwise provide insufficient operational value.

When a log is created or changed, `create` should apply the same rules used by `analyze` rather than maintaining a separate set of implementation rules.

The validation loop should stop after a bounded number of iterations. Use a maximum of **3 improvement cycles** unless the host agent provides a stricter limit.

At the end, report:

- what logging decision was made;
- what was created or changed, when applicable;
- the relevant rules applied;
- the final validation result;
- any remaining warning that could not be resolved safely or confidently.

## Decision flow

1. Determine the execution context with `runtime-aware-logging`.
2. Evaluate `when-to-log` to identify events with meaningful operational value.
3. Evaluate `when-not-to-log` to identify events that should remain unlogged.
4. Evaluate `duration-and-performance` when duration information could answer an operational question, **even if `when-not-to-log` determines that an individual log should not be emitted**. Duration may be better represented through an aggregate log, sampling, a metric, a trace, or another existing timing mechanism.
5. If logging is justified, apply `context` to determine the smallest useful amount of safe context.
6. Apply `identifiers-and-uuids` when the event needs an identifier, entity identity, operation identity, or correlation context.
7. Apply `traceability` when related events must remain correlatable across observable components, processes, systems, or SDK boundaries.
8. Apply `log-levels` to determine the semantic level of an existing or proposed log within the observable operation.
9. Apply `log-frequency` when the event can execute repeatedly or at high frequency.
10. Apply the specialized LogCraft rules for sensitive output, runtime, and CI/CD context.

The two decision rules are complementary: an event may look important enough to log, but still be better left unlogged because it is duplicated, excessively frequent, temporary, sensitive, or better represented by another observability mechanism.

Duration & Performance is a cross-cutting observability decision: it determines whether duration is worth observing and which measurement strategy best answers the operational question. It does not require the result to be an application log.

## Rules

- [`when-to-log`](rules/when-to-log.md) — determine whether an event has enough operational value to justify a log and what makes the event meaningful.
- [`when-not-to-log`](rules/when-not-to-log.md) — determine whether a log should explicitly be avoided and explain why.
- [`context`](rules/context.md) — evaluate who, what, where, and when; distinguish macro operational context from micro diagnostic context; and use event-specific context with existing identifiers without inventing or exposing sensitive values.
- [`identifiers-and-uuids`](rules/identifiers-and-uuids.md) — choose the most atomic meaningful identifier, evaluate composite identifiers, and use UUIDs only when a suitable identity or correlation mechanism does not already exist.
- [`traceability`](rules/traceability.md) — evaluate whether related events remain correlatable across the observable portion of an operation and identify evidence-based breaks in that relationship.
- [`log-levels`](rules/log-levels.md) — choose DEBUG, INFO, WARN, or ERROR according to operational meaning, operation outcome, available levels, and observable context.
- [`log-frequency`](rules/log-frequency.md) — evaluate repeated logs according to their level, information value, repetition cause, observable unit, and evidence of runtime amplification.
- [`duration-and-performance`](rules/duration-and-performance.md) — determine when duration information provides operational value, which measurement strategy best answers the operational question, what part of an operation should be measured, how to handle asynchronous and repeated flows, and when measurement should not be recommended.

## Interaction with other LogCraft guidance

Use the specialized rules after the initial logging decision:

- Use `runtime-aware-logging` to classify where the event executes.
- Use `context` when determining whether a justified log has enough useful context to explain why it exists and what happened.
- Use `log-frequency` when repetition or execution frequency can create excessive output without sufficient information value.
- Use `duration-and-performance` whenever timing information may answer an operational question, including when an individual log is rejected because of frequency, noise, or cost. Let it determine measurement strategy, granularity, asynchronous phases, repeated/batch alternatives, and measurement cost.
- Use `secret-safe-output` when the event or its context may expose sensitive data.
- Use `verbose-output` for permanently enabled diagnostic/verbose command output.
- Use `ci-context-rich-output` and `github-actions-summary` for CI/CD-specific output decisions.
- Use `identifiers-and-uuids` when choosing how an event, entity, operation, or execution should be identified.
- Use `traceability` when evaluating whether related events can be followed through observable boundaries.
- Use `log-levels` when evaluating whether the selected level accurately represents the operational meaning of the event.

A specialized rule may change the recommendation after this initial decision.

## Agent behavior

When reviewing or modifying code, prefer the command that matches the requested operation:

- Use `analyze` for review-only requests. Never modify code in this mode.
- Use `create` when the agent is asked to add or improve logging. Generate the smallest useful implementation, then re-run `analyze` against the result.
- If `create` produces findings, improve the implementation and analyze again, up to the bounded iteration limit.
- If the analysis concludes that no log should exist, preserve that decision instead of adding a log merely because the command was `create`.

Do not recommend adding a log just to make code more observable in the abstract. Explain the operational question the log is intended to answer.
