# Context

## Principle

Log context should make an event understandable without requiring every piece of surrounding information to be repeated in every log.

Evaluate four dimensions:

- **Who** — relevant actor, entity, service, process, component, or external system.
- **What** — the event or operation that occurred and its known result when relevant.
- **Where** — the component, service, module, process, or system where it occurred.
- **When** — the timestamp associated with the log or event, depending on what the logging mechanism provides.

These are dimensions to evaluate, not mandatory fields for every log. Not every event has a meaningful value for every dimension.

The goal is to answer:

> Why are we logging this?
>
> What happened in this process?

Recommend only the context necessary to answer those questions.

## Sufficient, not exhaustive context

Do not recommend adding every piece of information available. Context is sufficient when it allows an operator to understand the event's purpose, what happened, and any known relevant cause or result without unnecessary repetition.

Missing context is not automatically a problem. Report it when the absence materially prevents the event from being understood, diagnosed, or related to its operation.

## Macro and micro context

The same operation may be observed at two complementary levels.

### Macro: operational context

Macro context answers:

> What happened to the operation?

For example:

```text
INFO  | Synchronization started
WARN  | Synchronization completed with recoverable issues
ERROR | Synchronization failed after 3 attempts
```

It should make the state and known outcome understandable.

### Micro: diagnostic context

Micro context answers:

> How did the operation happen?
>
> Why did it behave this way?
>
> What can be diagnosed or optimized?

It may include relevant processing steps, retry attempts, query counts, bottlenecks, or dependency timings.

For example:

```text
DEBUG | Attempt 1 failed: request timeout after 5s
DEBUG | Batch 4 processed: 500 records
DEBUG | Persistence completed: 14 queries executed
```

Macro and micro context can coexist within the same operation. Do not force micro detail into an operational summary.

## Hybrid context

When an event belongs to a larger observable operation:

1. Include context specific to the event.
2. Preserve or use existing identifiers that connect it to the operation or related events.
3. Do not repeat complete operation context when an existing identifier provides the relationship.

An **entity identifier** identifies the entity involved in the event, such as `user_id` or `order_id`. An **operation or correlation identifier** identifies or connects a particular execution across related events.

Do not assume that an entity identifier provides operation continuity. The same entity can participate in multiple independent operations.

For example:

```text
INFO  | user_id=123 | operation_id=abc | Synchronization started
DEBUG | user_id=123 | operation_id=abc | Processing records
ERROR | user_id=123 | operation_id=abc | Synchronization failed
```

Here, `user_id` answers **who**, while `operation_id` connects the events to the same execution.

Do not recommend creating an operation or correlation identifier merely because an entity identifier exists. Use an existing identifier when the project already provides one; identifier creation and UUID policy belong to `identifiers-and-uuids` and `traceability`.

The event-specific fields explain **what happened here**. An operation or correlation identifier explains **which execution this event belongs to**.

Context and traceability have different responsibilities:

- **Context** explains the event.
- **Identifiers and Traceability** connect the event to the larger operation.

## Cause and known result

When a relevant cause can be determined reliably from available code, runtime, or context, include it when it makes the event more useful.

```text
WARN | Attempt 2/3 failed: request timeout after 10s
```

When a result is already known and relevant, include it:

```text
INFO  | Synchronization completed | records=500
ERROR | Synchronization failed | reason=database unavailable
```

Do not require a cause when it cannot be determined reliably. Do not invent causes from assumptions or message wording.

Do not predict future consequences in the current log. A log describes observable facts and known state at the time of the event. What happens next should be represented by the subsequent event.

## Incomplete context

When context is incomplete:

1. Analyze available code, data flow, runtime information, and existing logs.
2. Use context that can be demonstrated from the available evidence.
3. Infer context only when the implementation provides sufficient evidence.
4. Identify important context that remains missing when its absence limits understanding or diagnosis.
5. Do not invent actors, identifiers, components, causes, relationships, or outcomes.
6. Do not invalidate a log solely because a contextual dimension is unavailable.

For example:

```text
ERROR | Database connection failed
```

may establish that a database connection failed while leaving the originating operation unknown. Report the missing relationship if it materially affects diagnosis, but do not invent an operation or identifier.

## Sensitive context

A piece of information can be useful context and still be inappropriate to place directly in a log.

When context would expose sensitive information:

- do not include the sensitive value in the log;
- when useful, suggest an existing safe identifier representing the relevant entity or operation;
- do not invent an identifier when none exists;
- do not make masking, anonymization, hashing, or transformation the default recommendation for context.

For example, prefer an existing safe identifier when available:

```text
INFO | User synchronized | user_id=12345
```

instead of exposing an email address or other sensitive value.

The detailed definition and policy for sensitive data belongs to the dedicated `Sensitive data` guidance.

## Timestamp

A timestamp associated with a log normally tells when the log was emitted or recorded. Do not automatically treat it as the exact time when the described event occurred.

When the logging mechanism provides an emission timestamp, use it as the log timestamp. Do not add a duplicate timestamp solely because the logging framework already provides one.

Consider a separate event timestamp only when the implementation already has meaningful evidence that the event occurred at a different time and that distinction is relevant to understanding, diagnosis, ordering, or correlation.

For example, asynchronous or delayed processing may produce:

```text
log_timestamp=10:05:08 | event_timestamp=10:05:00 | INFO | Message processed
```

Do not require `event_timestamp` by default. Do not invent one when the implementation does not provide it.

The exact timestamp format is environment-specific and is outside this rule unless it is necessary to understand or correlate the event.

## False positives to avoid

Do not report insufficient context solely because:

- all four dimensions are not present;
- a user is not identified for a system-level event;
- an entity identifier is absent when no entity is relevant;
- an entity identifier exists but there is no operation identifier;
- an operation identifier is absent when the project has no such concept and operation continuity is not required;
- internal diagnostic details are not present in an operational summary;
- context is provided through an existing operation or correlation identifier;
- a logger timestamp is used when no distinct event timestamp is available or relevant;
- the complete architecture is not visible;
- a future consequence is not included in the current log.

Require evidence that missing context actually prevents the event from being understood, diagnosed, or related to its operation.

## Agent behavior

When reviewing or recommending log context:

1. Identify the event and its observable operation.
2. Evaluate the relevant **who, what, where, and when** dimensions.
3. Distinguish entity identifiers from operation or correlation identifiers; never assume one provides the role of the other.
4. Determine whether the event provides sufficient context to explain why it is logged and what happened.
5. Distinguish macro operational context from micro diagnostic context.
6. Use the hybrid approach: event-specific context plus existing identifiers for operation continuity.
7. Include a known, relevant cause when it can be determined reliably.
8. Include a known, relevant result when it is already observable.
9. Distinguish log emission time from event time when the implementation provides evidence that they differ and the distinction matters.
10. Never predict a future consequence or invent missing context or timestamps.
11. When context is incomplete, identify what can be demonstrated and what materially remains missing.
12. When useful context is sensitive, omit the sensitive value and suggest an existing safe identifier when one is available.
13. Do not require every contextual dimension or every available field in every log.
14. Keep sensitive-data definitions and policy in the dedicated `Sensitive data` guidance.
