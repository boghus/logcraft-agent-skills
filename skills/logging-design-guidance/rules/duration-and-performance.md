# Duration & Performance

## Principle

Duration information should help understand the temporal behavior of an operation and, when useful, identify possible bottlenecks, regressions, or anomalous execution times.

This rule is technology-independent. Evaluate the behavior and observability need of the operation, not whether the implementation uses a database, API, queue, file system, framework, or another specific technology.

Do not assume that a duration is slow, fast, acceptable, or problematic from the code alone. The acceptable duration is context-specific and belongs to the user or team responsible for the system.

Duration measurement should provide actionable operational value relative to its cost. For operations with negligible duration variability or measurement overhead relative to their value, duration measurement may add noise without providing useful insight.

## User intent comes first

Before recommending a duration measurement strategy, determine what the user wants to achieve by observing the operation's duration.

Possible goals include monitoring an operation, investigating possible bottlenecks, understanding a specific operation or step, measuring repeated or batch processing, or another explicit operational purpose.

When the purpose is unclear, ask the user what they want to learn from the duration information before making a specific measurement recommendation.

## Discover the observable flow

Analyze the code to identify the logical start and end of the operation and the relevant execution flow.

Consider the major flows observable in the available code rather than isolated methods only. An operation may be synchronous, asynchronous, event-driven, scheduled, batch-oriented, or distributed across execution contexts.

Infer the logical boundaries from the implementation and explain the evidence used for the recommendation.

## Choose a measurement strategy

When duration information has operational value, recommend the measurement strategy that best matches the user's objective, execution flow, frequency, existing observability mechanisms, and measurement cost.

Possible strategies include:

- an individual log;
- an aggregated or batch log;
- sampled logging;
- a metric;
- a trace or another existing timing mechanism.

These are alternatives for obtaining useful duration information, not mandatory technologies. This rule does not attempt to design a complete metrics or tracing strategy; it only considers them when they are a more appropriate way to obtain the duration information than individual logging.

When the user explicitly chooses to monitor duration, recommend an appropriate strategy rather than assuming that a log is the correct mechanism.

When duration has no clear operational value, do not recommend measurement merely because timing can be technically captured.

## Recommend, do not impose

Every recommendation should explain:

- **what** should be measured;
- **why** it is useful;
- **what evidence** supports the recommendation;
- **which measurement strategies and granularity options** make sense;
- **what cost or overhead** may be introduced;
- **what alternatives** are appropriate when individual logging is too expensive or noisy.

The final decision belongs to the user.

## Granularity

When an operation contains multiple meaningful stages, consider:

- the complete operation;
- relevant individual stages;
- both the complete operation and relevant stages.

Present the options and let the user choose the granularity that matches the operational goal.

Do not instrument every method by default. Recommend individual stage measurement when its timing could help answer the user's question, locate a possible bottleneck, or understand the operation's behavior.

## Asynchronous flows

When an asynchronous flow separates request/enqueue from later processing, treat these as distinct measurable phases:

1. **Request/enqueue duration** — how long it takes to submit or enqueue the asynchronous work.
2. **Processing duration** — how long the asynchronous work takes once processing begins.

Do not combine these phases when doing so would hide the distinction between submission time and processing time.

The rule is independent of the queue, broker, framework, or transport technology used.

Do **not** make queue-wait time or end-to-end request-to-completion duration default measurements. They can be dominated by backlog, concurrency, scheduling, or processing capacity rather than the duration of the operation itself. For example, if one worker processes 1,000 queued jobs at three seconds each, later jobs can have very large elapsed latency even though each processing execution still takes three seconds.

Consider queue-wait or end-to-end measurements only when the user explicitly needs to investigate that latency or the code provides a clear operational reason. Keep them separate from request/enqueue and processing durations rather than combining them.

## Repeated and batch operations

When an operation executes repeatedly, especially inside a high-frequency loop or batch, consider the volume of resulting log output before recommending per-execution duration logging.

For batch-oriented work, recommend an aggregated measurement when it better answers the user's objective and avoids unnecessary log amplification.

For example:

```text
operation=saveEmployees count=1000 durationMs=12400
```

For high-frequency operations, present alternatives when relevant:

- measuring each execution;
- measuring an aggregate or batch;
- sampling executions;
- using a metric instead of individual log events.

Explain the trade-off and recommend an option based on the user's objective, but let the user decide.

## Existing observability mechanisms

Before recommending new duration instrumentation, check whether equivalent timing information already exists through logging, metrics, tracing, APM, CI/CD, or another observability mechanism.

If equivalent information exists, tell the user what was found and let the user decide whether additional logging or measurement is useful.

When adding instrumentation is appropriate, reuse the project's existing timing or measurement mechanisms whenever possible.

## Measurement cost and project context

Consider runtime overhead, generated log volume, implementation complexity, new infrastructure, and maintenance cost.

If measurement could materially increase execution time, complexity, or output volume, make the trade-off explicit.

Adapt recommendations to the inferred size and complexity of the project. Expose that interpretation to the user so it can be corrected when inaccurate.

## Representation

When duration is logged, represent it as a numeric value with an explicit and consistent unit.

Do not require one universal unit across projects; choose a unit appropriate to the project's conventions and the user's needs.

For example:

```text
operation=syncEmployees durationMs=80000
```

Do not use free-form text as the only representation when the duration is intended for automated analysis.

## Success, warning, and error outcomes

Duration guidance applies regardless of the outcome or log level of the operation.

Do not make duration measurement conditional on success, WARN, or ERROR. The appropriate log level remains the responsibility of `log-levels`.

## When not to recommend duration

Do not recommend duration measurement when there is no clear operational value.

Consider not recommending it when:

- the operation is trivial and there is no identified monitoring or diagnostic need;
- equivalent timing information already exists and additional measurement adds no clear value;
- the measurement would create disproportionate output or runtime overhead;
- introducing it would add significant complexity without corresponding observability benefit;
- the code provides no evidence that timing information would answer a meaningful operational question;
- duration variability or the expected insight is negligible relative to the cost of measuring it.

Not recommending a measurement is not a prohibition. The user may still choose to measure it.

## False positives to avoid

Do not infer that an operation is a bottleneck merely because it contains an apparently expensive step or many operations.

Static code analysis cannot establish real runtime duration or acceptable thresholds without runtime evidence or domain context.

Prefer:

> Consider measuring this stage because it may contribute significantly to the operation's execution time.

Avoid:

> This stage is slow.

unless runtime evidence supports that conclusion.

## Agent behavior

When reviewing or recommending duration and performance observability:

1. Identify the observable operation and its logical execution boundaries.
2. Determine the user's monitoring objective; ask when it is unclear.
3. Inspect the relevant execution flows and identify where duration information could answer the operational question.
4. Check for existing timing or observability mechanisms.
5. Reuse existing project mechanisms when possible.
6. Determine whether duration measurement has operational value relative to its cost.
7. Recommend an appropriate measurement strategy and explain the evidence.
8. Offer granularity options and let the user choose.
9. For asynchronous flows, distinguish request/enqueue duration from processing duration; do not default to queue-wait or end-to-end latency.
10. For repeated or high-frequency operations, evaluate output volume and offer batch, sampling, metrics, or individual measurement alternatives when appropriate.
11. When duration is logged, represent it numerically with an explicit, consistent unit.
12. Apply the rule regardless of whether the operation succeeds, warns, or fails; do not select log level here.
13. Consider runtime overhead, log volume, implementation complexity, and project context.
14. Recommend measurement when there is evidence of operational value, but do not require logging solely because duration can be captured.
15. Do not infer runtime thresholds, bottlenecks, or acceptable durations without evidence.
16. When measurement is not justified, explain why.
17. Keep cross-cutting concerns such as duplicate logging, identifiers, traceability, context, log levels, and structured logging in their dedicated rules.
