# When to log

## Principle

A log should exist because the event provides useful operational information, not simply because code reached a method, branch, or statement.

Before adding a log, determine whether the event helps a developer or operator understand what happened, why it happened, or what needs attention.

Logging is a design decision. Do not recommend a log merely because a code path is important, executes an error branch, or contains a variable that might be useful during debugging.

## Questions to ask before logging

First determine the execution context with `runtime-aware-logging`. Then evaluate the event in this order:

1. **What happened?**
   - Identify the meaningful event, state transition, decision, failure, or interaction.
2. **Who needs to know?**
   - Consider whether the information is useful for production operations, incident diagnosis, security investigation, business operations, or temporary development diagnostics.
3. **What decision could this log support?**
   - A useful log should help someone diagnose, correlate, measure, or understand an operationally relevant event.
4. **Is the event already observable elsewhere?**
   - Do not treat metrics, traces, alerts, status checks, or other signals as automatically equivalent to logs.
   - Consider an event a duplicate only when the alternative mechanism answers the same operational question with sufficient diagnostic context.
   - A metric may confirm that something happened while a log preserves identifiers, reason, outcome, or other context needed to diagnose it.
5. **How often can it happen?**
   - Consider frequency and execution paths before adding the log. High-frequency events may require sampling, aggregation, a metric, or no log at all. Use `log-frequency` when repeated execution can create excessive output without sufficient information value.
6. **Does it contain information that should not be logged?**
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

## What makes an event meaningful

A useful event normally answers at least one operational question:

- **What operation happened?**
- **Which relevant entity or request was involved?**
- **What was the outcome?**
- **Why did it fail or take an unusual path?**
- **How long did an important operation take?**
- **Can the event be correlated with related work?**

Do not force every log to answer every question. The amount of context should match the event and its operational purpose.

## Example: meaningful event

Prefer a log that records the outcome of an important operation and enough safe context to investigate it:

```java
log.info(
    "Payment processed paymentId={} orderId={} durationMs={}",
    paymentId,
    orderId,
    durationMs
);
```

This example uses SLF4J-style placeholders. Use the logging API appropriate to the project's runtime and existing conventions rather than assuming every project uses SLF4J.

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
