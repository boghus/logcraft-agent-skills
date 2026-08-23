# Duration & Performance

## Principle

Duration information should help understand the temporal behavior of an operation and, when useful, identify possible bottlenecks, regressions, or anomalous execution times.

This rule is technology-independent. Evaluate the behavior and observability need of the operation, not whether the implementation uses a database, API, queue, file system, framework, or another specific technology.

Do not assume that a duration is slow, fast, acceptable, or problematic from the code alone. The acceptable duration is context-specific and belongs to the user or team responsible for the system.

## User intent comes first

Before recommending duration instrumentation, determine what the user wants to achieve with the measurement.

Possible goals include:

- monitoring an operation over time;
- investigating possible bottlenecks;
- understanding the duration of a specific operation or step;
- observing an external or infrastructure-dependent stage;
- measuring repeated or batch processing;
- using duration information for another explicit operational purpose.

These goals may lead to different measurement strategies. Do not silently choose a strategy when the user's objective is unknown.

When the purpose is unclear, ask the user what they want to learn from the duration information before making a specific instrumentation recommendation.

## Discover the observable flow

Analyze the code to identify the logical start and end of the operation and the relevant execution flow.

Consider the major flows that can be observed in the available code rather than inspecting isolated methods only. The exact boundaries depend on the implementation and execution model.

An operation may be synchronous, asynchronous, event-driven, scheduled, batch-oriented, or otherwise distributed across execution contexts.

Do not assume a single universal definition of an operation. Infer the logical boundaries from the implementation and explain the evidence used for the recommendation.

## Measure when it provides operational value

When the user explicitly chooses to monitor an operation, recommend capturing its duration as part of that monitoring information.

When the user has not explicitly requested monitoring, duration instrumentation may still be recommended when the code provides evidence that the measurement could help answer an operational question. The recommendation is optional and must explain why the measurement could be useful.

Useful evidence may include, but is not limited to:

- multiple execution stages whose relative duration may matter;
- processing of a significant or variable volume of work;
- repeated execution where individual timings could create excessive output;
- execution whose duration can vary materially with runtime conditions;
- an operation whose timing would help investigate a known or plausible performance concern;
- a flow where measuring specific stages could help locate where time is being spent.

Do not reduce this analysis to a rigid list of patterns. Explain the evidence found in the code and the operational question the measurement would help answer.

## Recommend, do not impose

LogCraft should recommend duration instrumentation rather than require it when the need is inferred from code.

Every recommendation should explain:

- **what** should be measured;
- **why** the measurement is useful;
- **what evidence** in the code supports the recommendation;
- **which granularity options** are available when more than one makes sense;
- **what cost or overhead** the instrumentation may introduce;
- **what alternatives** may be appropriate when individual logging is too expensive or noisy.

The final decision belongs to the user.

Do not claim that a measurement is mandatory merely because an operation appears expensive or important.

## Granularity

When an operation contains multiple meaningful stages, consider the following measurement options:

- the complete operation;
- relevant individual stages;
- both the complete operation and relevant stages.

Present the available options and let the user choose the granularity that matches the operational goal.

Do not instrument every method by default. A stage should be recommended for individual measurement when there is evidence that its timing could help answer the user's question, locate a possible bottleneck, or understand the operation's behavior.

When the complete operation is monitored, its total duration can provide a useful reference for understanding the relative contribution of measured stages, but the rule must not require both total and stage measurements in every case.

## Asynchronous flows

When an asynchronous flow separates request/enqueue from later processing, treat these as distinct measurable phases.

Recommend measuring, when applicable:

1. **Request/enqueue duration** — how long it takes to submit or enqueue the asynchronous work.
2. **Processing duration** — how long the asynchronous work takes once processing begins.

Do not combine these phases into one duration when doing so would hide the distinction between submission time and processing time.

The rule is independent of the queue, broker, framework, or transport technology used to implement the asynchronous flow.

The time spent waiting between enqueue and processing, or an end-to-end duration from request to completion, is **not a default measurement for this rule**. Those values can be dominated by backlog, concurrency, scheduling, or processing capacity rather than the duration of the operation itself. For example, if one worker processes 1,000 queued jobs at three seconds each, later jobs can have very large elapsed latency even though each processing execution still takes three seconds.

Only consider queue-wait or end-to-end measurements when the user explicitly needs to investigate that latency or the code provides a clear operational reason for it. Keep such measurements separate from request/enqueue and processing durations rather than combining them.

## Repeated and batch operations

When an operation executes repeatedly, especially inside a high-frequency loop or batch, consider the volume of resulting log output before recommending per-execution duration logging.

For batch-oriented work, recommend an aggregated measurement when it better answers the user's objective and avoids unnecessary log amplification.

For example:

```text
operation=saveEmployees count=1000 durationMs=12400
```

The processed count may provide useful context for interpreting a batch duration, but do not require derived metrics such as cost per element unless the user explicitly needs that analysis.

For high-frequency operations, present appropriate alternatives when relevant, such as:

- measuring each execution;
- measuring an aggregate or batch;
- sampling executions;
- using a metric instead of individual log events.

Explain the trade-off and recommend an option based on the user's stated objective, but let the user decide.

## Existing observability mechanisms

Before recommending new duration instrumentation, check whether the project already provides equivalent timing information through its existing logging, metrics, tracing, APM, CI/CD, or other observability mechanisms.

If equivalent information already exists, tell the user what was found and let the user decide whether additional logging is still useful.

Do not automatically declare the new log unnecessary, and do not duplicate an existing mechanism without explaining the additional value.

When adding instrumentation is appropriate, reuse the project's existing timing or measurement mechanisms whenever possible instead of introducing a new mechanism solely for this purpose.

## Measurement cost and project context

Consider the cost of the proposed measurement, including:

- runtime overhead;
- generated log volume;
- implementation complexity;
- introduction of new infrastructure or mechanisms;
- maintenance cost.

If the measurement could materially increase execution time, complexity, or output volume, make the trade-off explicit.

Adapt recommendations to the inferred size and complexity of the project. LogCraft should infer the project context from the repository when possible and expose that interpretation to the user so it can be corrected when inaccurate.

Do not prohibit a costly measurement solely because it has overhead. Explain the cost and allow the user to decide whether the expected observability value justifies it.

## Representation

Represent duration as a numeric value so that it can be consumed reliably by logging, observability, aggregation, and analysis systems.

The unit should be explicit and consistent. Do not require one universal unit across all projects; choose a unit appropriate to the project's existing conventions and the user's needs.

Additional human-readable representations may be useful in some contexts, but they are not required when the numeric value and unit are clear.

For example:

```text
operation=syncEmployees durationMs=80000
```

Do not use free-form text as the only representation when the duration is intended for automated analysis.

## Success, warning, and error outcomes

Duration guidance applies regardless of the outcome or log level of the operation.

A duration may be useful for:

- successful operations;
- operations completed with warnings;
- failed operations.

For example:

```text
operation=syncEmployees status=success durationMs=8200
operation=syncEmployees status=error durationMs=8230
```

Do not make duration instrumentation conditional on success, WARN, or ERROR. The appropriate log level remains the responsibility of `log-levels`.

## When not to recommend duration

Do not recommend duration instrumentation when there is no clear operational value in measuring it.

Consider not recommending it when:

- the operation is trivial and there is no identified monitoring or diagnostic need;
- equivalent timing information is already available and additional instrumentation adds no clear value;
- the measurement would create disproportionate output or runtime overhead;
- introducing the measurement would add significant complexity without a corresponding observability benefit;
- the code provides no evidence that the timing information would answer a meaningful operational question.

Not recommending a measurement is not a prohibition. The user may still choose to instrument the operation.

## Avoid false precision

Do not infer that an operation is a bottleneck merely because it contains an apparently expensive step or a large number of operations.

Static code analysis cannot establish the real runtime duration or an acceptable threshold without runtime evidence or domain context.

Use language such as:

> Consider measuring this stage because it may contribute significantly to the operation's execution time.

Avoid language such as:

> This stage is slow.

unless runtime evidence supports that conclusion.

## Agent behavior

When reviewing or recommending duration and performance logging:

1. Identify the observable operation and its logical execution boundaries.
2. Determine whether the user has explicitly chosen a monitoring objective; ask when the objective is unclear.
3. Inspect the relevant execution flows and identify where duration information could answer the user's operational question.
4. Check for existing timing or observability mechanisms before recommending new instrumentation.
5. Reuse existing project mechanisms when possible.
6. Recommend the operation, stage, or phases to measure and explain the evidence supporting the recommendation.
7. Offer granularity options when the operation contains multiple meaningful stages and let the user choose.
8. For asynchronous flows, distinguish request/enqueue duration from processing duration; do not default to queue-wait or end-to-end latency measurements.
9. For repeated or high-frequency operations, evaluate output volume and offer batch, sampling, metrics, or individual measurement alternatives when appropriate.
10. Represent duration numerically with an explicit, consistent unit.
11. Apply the rule regardless of whether the operation succeeds, warns, or fails; do not select log level here.
12. Consider runtime overhead, log volume, implementation complexity, and project context, and explain material trade-offs.
13. Infer project size/context when possible and allow the user to correct the interpretation.
14. Recommend measurement when there is evidence of operational value, but do not require it solely from static code analysis.
15. Do not infer runtime thresholds, bottlenecks, or acceptable durations without evidence.
16. When measurement is not justified, explain why and identify any relevant alternative when appropriate.
17. Keep cross-cutting concerns such as duplicate logging, identifiers, traceability, context, log levels, and structured logging in their dedicated rules rather than duplicating their policies here.
