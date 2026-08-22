# Log levels

## Principle

Choose a log level according to the operational meaning and impact of the event within the observable operation.

Do not assign a level solely because an exception occurred, a particular method was called, or a message contains words such as `failed` or `error`.

Evaluate the operation and its outcome in the context that is actually available. Do not assume capabilities or levels that the project's logging mechanism does not provide.

## Supported levels

LogCraft evaluates the levels that are actually available and used by the project. The core semantic model is:

| Level | Meaning |
| --- | --- |
| `DEBUG` | Additional diagnostic detail useful when investigating behavior. It may include detailed intermediate steps or retry information when that detail is useful for diagnosis, but it does not mean logging everything. |
| `INFO` | A normal, operationally relevant event that should be traceable. It may represent the start, relevant progress, or result of an operation. |
| `WARN` | A non-ideal condition where the operation can still continue or recover. This includes potentially problematic conditions, recoverable failures, degradation, and unexpected but controlled situations. |
| `ERROR` | The operation did not achieve its expected result. |

`TRACE` is outside the LogCraft level model. Do not introduce or recommend it as an additional level.

## Evaluate the operation, not only the event

The level describes the operational meaning of the event within the operation being observed.

For example, an exception does not automatically make an event `ERROR`:

```text
attempt 1 -> exception -> retry
attempt 2 -> success
```

If the operation remains recoverable, the intermediate failure may be represented as `WARN` when that event is worth recording. The final successful result can be `INFO`.

When retries are exhausted and the operation cannot achieve its expected result:

```text
attempt 1 -> recoverable failure
attempt 2 -> recoverable failure
attempt 3 -> failure
operation -> ERROR
```

The level should reflect the state and impact of the operation, not merely the presence of an exception in an individual attempt.

## WARN semantics

Use `WARN` when the system is operating outside ideal conditions but the operation has not definitively failed.

This includes:

- a condition that could potentially lead to failure;
- a recoverable failure or retryable attempt;
- degraded behavior where the operation can still succeed;
- an unexpected but controlled situation.

Do not use `WARN` simply because something is unusual. The condition should have operational relevance.

## ERROR semantics

Use `ERROR` when the operation cannot achieve its expected result.

Examples include:

- retries are exhausted and the operation fails;
- a required condition prevents the operation from completing;
- an unrecoverable failure prevents the expected outcome;
- the operation reaches an outcome that violates its expected contract and cannot recover.

An exception by itself is not sufficient evidence for `ERROR`. Determine whether the exception prevents the operation from reaching its expected result.

## INFO semantics

Use `INFO` for normal operational events that are useful to understand and trace.

An `INFO` event may describe:

- the beginning of a relevant operation;
- meaningful progress in a long-running operation;
- a significant transition;
- the successful or otherwise expected result of an operation.

Avoid turning every internal step into `INFO`. Diagnostic detail belongs at a more detailed level when the project provides one.

## DEBUG semantics

Use `DEBUG` for additional diagnostic information that is useful when investigating behavior but is not required to understand normal operation.

Examples include:

- intermediate decisions;
- detailed processing steps;
- individual retry attempts when detailed retry diagnostics are useful;
- internal state needed to diagnose a problem, provided it is safe to record.

`DEBUG` does not mean that every internal value or execution step should be logged.

## Retries and recovery

Evaluate retries as part of the operation's observable context.

A real retry within the same operation may produce a sequence such as:

```text
attempt 1 -> recoverable failure -> WARN
attempt 2 -> recoverable failure -> WARN
attempt 3 -> success -> INFO
```

The exact amount of retry detail depends on what is useful and what levels the project actually supports.

Do not assume that two executions are retries merely because one happened after another. A separately triggered execution, such as a manually restarted CI run, may be an independent operation unless an explicit relationship is observable.

## Available levels and fallback

Do not assume that every project supports every level.

First determine which levels the project's existing logging mechanism provides and uses. This may vary by language, framework, runtime, or logging implementation.

If the semantically preferred level is not available, use the closest available level rather than inventing a new capability or prescribing an infrastructure change.

For example, if detailed diagnostic information would conceptually fit `DEBUG` but the project only provides `INFO`, `WARN`, and `ERROR`, `INFO` is the appropriate available fallback when the event is still operationally relevant.

Do not recommend installing a logging framework, enabling an additional level, or changing logger configuration as part of this guidance.

## Do not confuse logging levels with execution state

A logging level and an execution result are related but not identical.

For example, a CI system may report a failed process through an exit code even when the output contains no `ERROR` log. Conversely, a message containing the word `ERROR` does not necessarily mean the entire operation failed.

Evaluate the semantic level of the log event separately from external execution signals such as exit codes, job status, or runner state.

## False positives to avoid

Do not report an incorrect level solely because:

- an exception was caught or thrown;
- a message contains the word `error` or `failed`;
- a retry occurred;
- the event was unusual but successfully handled;
- the project's framework does not support the theoretically ideal level;
- a CI job failed without an application-level `ERROR` log;
- an application log appears in a CI output stream.

Use the observable operational context to determine whether the level accurately represents the event.

## Agent behavior

When reviewing or recommending log levels:

1. Identify the observable operation represented by the event.
2. Determine the operational meaning and impact of the event within that operation.
3. Identify the levels actually available in the project's existing logging mechanism.
4. Choose `DEBUG`, `INFO`, `WARN`, or `ERROR` according to their semantic definitions when those levels are available.
5. Treat retries and recovery as part of the operation's context.
6. Use the closest available level when the ideal semantic level is not supported.
7. Do not invent logging capabilities or recommend infrastructure/configuration changes as part of this guidance.
8. Do not infer severity solely from exception types, message text, exit codes, or CI output.
9. Do not introduce `TRACE` as part of the LogCraft level model.
10. Explain the reasoning when the available context is insufficient to determine the appropriate level confidently.
