# When not to log

## Principle

Before adding or keeping a log, explicitly check whether the event is better left unlogged. A log creates storage, processing, search, and cognitive cost; its presence should therefore be justified by an operational question it can help answer.

## Do not log when

- **There is no actionable operational value.** If the event does not help explain behavior, diagnose a failure, correlate related work, or support an operational decision, it is probably noise.
- **The event is ordinary execution flow.** Avoid logs for method entry or exit, routine method calls, branches, assignments, getters/setters, or successful steps that provide no additional diagnostic value.
- **The same information is already available with sufficient context.** Do not emit a second log simply because another log, trace, metric, alert, or telemetry event already answers the same operational question.
- **The log would fire at excessive volume without a corresponding need.** High-frequency events can overwhelm storage and make useful signals harder to find. Consider sampling, aggregation, metrics, tracing, or no log instead.
- **The log is only temporary debugging.** Remove investigation-only logs when they are no longer required, unless the event has a documented permanent operational purpose.
- **The data is sensitive and is not required for diagnosis.** Never justify logging secrets, credentials, tokens, or unnecessary personal or business-sensitive data merely because it is available at that point in the code.
- **The exception is already logged elsewhere without additional context.** Avoid turning one failure into multiple indistinguishable error events.
- **The log is being used to compensate for missing instrumentation.** First determine whether a metric, trace, health check, or domain event is the more appropriate signal.
- **The value can be derived reliably from another event.** Avoid repeating information that can be reconstructed without losing useful diagnostic context.

For high-frequency diagnostics, consider a debug level, sampling, aggregation, metrics, tracing, or another observability mechanism instead of a permanent application log.

## Decision rule

Before creating a log, ask:

> **What operational question will this log help answer?**

If there is no clear answer, do not add the log.

If there is a clear answer, continue evaluating frequency, context, sensitivity, duplication, and log level before deciding how to record it.

## Example: noise

Avoid adding logs like:

```java
log.info("Entering processPayment");
log.info("Payment object received");
log.info("Processing payment");
```

These statements describe execution rather than an operationally meaningful event.

## Exceptions and false positives

Do not remove a log merely because it appears simple. A short event can be valuable if it marks an important state transition, security event, deployment step, job boundary, or external dependency outcome.

Do not require production application logs for local-only diagnostics when the code and environment clearly scope them to development.

Do not replace a useful log with a metric simply because metrics are more efficient. Logs and metrics answer different questions; choose the mechanism that preserves the information needed for diagnosis.
