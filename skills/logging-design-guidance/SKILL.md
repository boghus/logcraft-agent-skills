---
name: logging-design-guidance
description: Decide whether an event is worth logging before adding or changing application logs, using operational value and runtime context rather than log presence alone.
---

# Logging design guidance: when to log

## Principle

A log should exist because the event provides useful operational information, not simply because code reached a method, branch, or statement.

Before adding a log, determine whether the event helps a developer or operator understand what happened, why it happened, or what needs attention.

Logging is a design decision. Do not recommend a log merely because a code path is important, executes an error branch, or contains a variable that might be useful during debugging.

## Questions to ask before logging

Evaluate the event in this order:

1. **What happened?**
   - Identify the meaningful event, state transition, decision, failure, or interaction.
2. **Who needs to know?**
   - Consider whether the information is useful for production operations, incident diagnosis, security investigation, business operations, or temporary development diagnostics.
3. **What decision could this log support?**
   - A useful log should help someone diagnose, correlate, measure, or understand an operationally relevant event.
4. **Is the event already observable elsewhere?**
   - Avoid adding a duplicate log when the same event is already recorded by a reliable logging, tracing, metrics, or telemetry mechanism.
5. **What is the execution context?**
   - Apply `runtime-aware-logging` before assuming that application logging is appropriate. Browser, build-time, server, CI/CD, deployment, and local development output have different purposes.
6. **How often can it happen?**
   - Consider frequency and execution paths before adding the log. High-frequency events may require sampling, aggregation, a metric, or no log at all. Use `log-amplification` when repeated execution can multiply output.
7. **Does it contain information that should not be logged?**
   - Consider secrets, credentials, tokens, personal data, financial information, full payloads, and other sensitive values. Use `secret-safe-output` when evaluating output exposure.

## Prefer logging when

A log is generally valuable when it records an event such as:

- a significant state transition;
- a business or operational decision that may need investigation;
- the start or completion of an important asynchronous job;
- a meaningful failure or recovery event;
- an interaction with an external dependency where the outcome matters operationally;
- an authorization or security event that is appropriate to record;
- a deployment, migration, or infrastructure event that operators need to understand;
- a diagnostic event whose frequency and level are explicitly appropriate for its environment.

The event should still include only the context needed to make it useful and safe.

## Avoid logging when

Do not recommend a log solely for:

- method entry or exit;
- every branch of ordinary control flow;
- routine variable assignments;
- values that can be derived reliably from another event;
- successful operations that occur at very high frequency without operational value;
- duplicate information already emitted by the application's logging or telemetry layer;
- temporary debugging statements that are no longer needed after the investigation;
- sensitive payloads when the payload itself is not required for diagnosis.

For high-frequency diagnostics, consider a debug level, sampling, aggregation, metrics, tracing, or another observability mechanism instead of a permanent application log.

## What makes an event meaningful

A useful event normally answers at least one operational question:

- **What operation happened?**
- **Which relevant entity or request was involved?**
- **What was the outcome?**
- **Why did it fail or take an unusual path?**
- **How long did an important operation take?**
- **Can the event be correlated with related work?**

Do not force every log to answer every question. The amount of context should match the event and its operational purpose.

## Example: noise

Avoid adding logs like:

```java
log.info("Entering processPayment");
log.info("Payment object received");
log.info("Processing payment");
```

These statements describe execution rather than an operationally meaningful event.

## Example: meaningful event

Prefer a log that records the outcome of an important operation and enough safe context to investigate it:

```java
log.info("Payment processed", paymentId, orderId, durationMs);
```

The exact fields and structured format depend on the logging framework. Do not invent identifiers or fields that do not exist merely to make the example look complete.

## Failure events

Do not automatically log every caught exception.

Before adding an error log, determine:

- whether the exception is already logged at a higher layer;
- whether this layer can add context that would otherwise be lost;
- whether the failure is expected and handled normally;
- whether the event should instead be represented as a metric, trace, response, or domain event.

Avoid logging the same failure at multiple layers without additional context. Duplicate error logs can make one incident appear to be several failures.

## Level selection

Choosing whether an event deserves a log is separate from choosing its level.

After deciding that the event is worth recording, choose the level according to its operational importance, frequency, and actionability. Do not use `ERROR` merely because an exception object exists, and do not use `INFO` for every successful operation.

If the event is only useful during diagnosis and would create noise in normal operation, consider `DEBUG` or the runtime's equivalent diagnostic level.

## Interaction with other LogCraft guidance

This guidance is the first decision point, not a replacement for the specialized rules:

- Use `runtime-aware-logging` to classify where the event executes.
- Use `log-amplification` when frequency or repeated execution can create excessive output.
- Use `secret-safe-output` when the event or its context may expose sensitive data.
- Use `verbose-output` for permanently enabled diagnostic/verbose command output.
- Use `ci-context-rich-output` and `github-actions-summary` for CI/CD-specific output decisions.

A specialized rule may change the recommendation after this initial decision.

## False positives and exceptions

Do not remove a log merely because it appears simple. A short event can be valuable if it marks an important state transition, security event, deployment step, job boundary, or external dependency outcome.

Do not require production application logs for local-only diagnostics when the code and environment clearly scope them to development.

Do not replace a useful log with a metric simply because metrics are more efficient. Logs and metrics answer different questions; choose the mechanism that preserves the information needed for diagnosis.

## Agent behavior

When reviewing or modifying code:

1. Identify the event and its runtime context.
2. Decide whether the event has operational value.
3. Check whether equivalent observability already exists.
4. Estimate frequency and potential output amplification.
5. Check data sensitivity.
6. If logging is justified, recommend the smallest useful amount of safe context.
7. If logging is not justified, explain what makes it noise and what alternative, if any, would better serve the use case.

Do not recommend adding a log just to make code more observable in the abstract. Explain the operational question the log is intended to answer.
