# Context

## Principle

Log context should make an event understandable without requiring every piece of surrounding information to be repeated in every log.

Evaluate context through four dimensions:

- **Who** — the relevant actor, entity, service, process, component, or external system.
- **What** — the event or operation that occurred and its known result when relevant.
- **Where** — the component, service, module, process, or system where the event occurred.
- **When** — the timestamp of the event.

These are dimensions to evaluate, not mandatory fields for every log. Not every event has a meaningful value for every dimension.

The goal is to answer:

> Why are we logging this?
>
> What happened in this process?

Recommend only the context necessary to answer those questions for the event being observed.

## Sufficient, not exhaustive context

Do not recommend adding every piece of information available to an event.

Context is sufficient when it allows an operator to understand the event's purpose, what happened, and any known relevant cause or result without requiring unnecessary repetition.

For example:

```text
INFO | Application started
```

does not require a user or entity identity if none is relevant to understanding the event.

Conversely:

```text
INFO | User synchronized
```

may require an entity identifier or other relevant context when the identity is necessary to understand which entity was affected.

Do not treat missing context as an error by itself. Determine whether the missing information actually prevents the event from being understood or related to its operation.

## Macro and micro context

The same operation may be observed at two complementary levels.

### Macro: operational context

Macro context helps answer:

> What happened to the operation?

It is most useful for operational events such as:

```text
INFO  | Synchronization started
WARN  | Synchronization completed with recoverable issues
ERROR | Synchronization failed after 3 attempts
```

The context should make the state and known outcome of the operation understandable.

### Micro: diagnostic context

Micro context helps answer:

> How did the operation happen?
>
> Why did it behave this way?
>
> What can be diagnosed or optimized?

It may include relevant internal details such as processing steps, retry attempts, query counts, bottlenecks, or dependency timings when those details provide diagnostic value.

For example:

```text
DEBUG | Attempt 1 failed: request timeout after 5s
DEBUG | Batch 4 processed: 500 records
DEBUG | Persistence completed: 14 queries executed
```

Macro and micro context can coexist within the same operation. Do not force micro-level detail into an operational summary merely to make the summary complete.

## Hybrid context

Use a hybrid approach when an event belongs to a larger observable operation:

1. Include context specific to the event.
2. Preserve or use existing identifiers that connect the event to its operation or related events.
3. Do not repeat the complete operation context in every event when an existing identifier provides the relationship.

For example:

```text
INFO  | operation_id=123 | Synchronization started
DEBUG | operation_id=123 | step=validation | 500 records validated
WARN  | operation_id=123 | attempt=2/3 | dependency timeout
INFO  | operation_id=123 | Synchronization completed | attempts=3
```

The event-specific fields explain **what happened here**. The identifier explains **which operation this event belongs to**.

Context and traceability have different responsibilities:

- **Context** explains the event.
- **Identifiers and Traceability** connect the event to the larger operation.

Do not duplicate context merely because another log contains it. Preserve the relationship needed to reconstruct the observable operation.

## Cause and known result

When a relevant cause can be determined reliably from the available code, runtime, or context, include it when doing so makes the event more useful.

For example:

```text
WARN | Attempt 2/3 failed: request timeout after 10s
```

is more useful than:

```text
WARN | Attempt 2/3 failed
```

because the known cause helps explain the event.

When a result is already known, include it when it is relevant to understanding the event or operation:

```text
INFO  | Synchronization completed | records=500
ERROR | Synchronization failed | reason=database unavailable
```

Do not require a cause when it cannot be determined reliably. Do not invent a cause from assumptions or message wording.

Do not predict future consequences in the current log. A log describes observable facts and known state at the time of the event. What happens next should be represented by the subsequent event when it occurs.

## Incomplete context

Context may be incomplete. When it is:

1. Analyze the available code, data flow, runtime information, and existing logs.
2. Use context that can be demonstrated from the available evidence.
3. Infer context only when the implementation provides sufficient evidence for the inference.
4. Identify important context that remains missing when its absence limits understanding or diagnosis.
5. Do not invent actors, identifiers, components, causes, relationships, or outcomes.
6. Do not invalidate a log solely because some contextual dimension is unavailable.

For example:

```text
ERROR | Database connection failed
```

may establish that a database connection failed while leaving the originating operation unknown. Report the missing relationship if it materially affects diagnosis, but do not invent an operation or identifier.

## Sensitive context

A piece of information can be useful context and still be inappropriate to place directly in a log.

When context would expose sensitive information:

- do not include the sensitive value in the log;
- when useful, suggest an existing safe identifier that can represent the relevant entity or operation;
- do not invent an identifier as a substitute when none exists;
- do not make masking, anonymization, hashing, or transformation the default recommendation for context.

For example, prefer an existing safe identifier when available:

```text
INFO | User synchronized | user_id=12345
```

instead of exposing an email address or other sensitive value.

The detailed definition and policy for sensitive data belongs to the dedicated `Sensitive data` guidance. Context only establishes that sensitive information should not be emitted merely because it would be useful context.

## Timestamp

A timestamp is part of the context evaluation because it establishes when the event occurred.

Prefer the timestamp provided by the existing logging or runtime mechanism when it is available. Do not add a duplicate timestamp solely because the logging framework already provides one.

The exact timestamp format is environment-specific and is outside this rule unless it is necessary to understand the event or correlate it with other observable events.

## False positives to avoid

Do not report insufficient context solely because:

- all four dimensions are not present;
- a user is not identified for a system-level event;
- an entity identifier is absent when no entity is relevant;
- internal diagnostic details are not present in an operational summary;
- context is provided through an existing operation or correlation identifier;
- the complete architecture is not visible;
- a future consequence is not included in the current log.

Require evidence that the missing context actually prevents the event from being understood, diagnosed, or related to its operation.

## Agent behavior

When reviewing or recommending log context:

1. Identify the event and its observable operation.
2. Evaluate the relevant **who, what, where, and when** dimensions.
3. Determine whether the event provides sufficient context to explain why it is logged and what happened.
4. Distinguish macro operational context from micro diagnostic context.
5. Use the hybrid approach: event-specific context plus existing identifiers for operation continuity.
6. Include a known, relevant cause when it can be determined reliably.
7. Include a known, relevant result when it is already observable.
8. Never predict a future consequence or invent missing context.
9. When context is incomplete, identify what can be demonstrated and what materially remains missing.
10. When useful context is sensitive, omit the sensitive value and suggest an existing safe identifier when one is available.
11. Do not require every contextual dimension or every available field in every log.
12. Keep sensitive-data definitions and policy in the dedicated `Sensitive data` guidance.
