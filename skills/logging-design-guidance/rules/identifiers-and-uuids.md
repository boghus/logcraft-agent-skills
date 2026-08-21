# Identifiers & UUIDs

## Principle

A log should identify the entity, operation, or event that gives the message its operational meaning. An identifier is useful when it lets an operator locate, distinguish, or relate the event to something meaningful in the system.

Do not add identifiers simply because an `id` or UUID is available. Choose the identifier whose scope most closely matches the event being logged.

## Identify the event before choosing the identifier

Determine what the log is actually about:

1. Identify the entity, operation, or event being logged.
2. Inspect the project context to discover the relevant entities, relationships, and identifiers rather than assuming naming conventions.
3. Prefer the most atomic meaningful identifier that uniquely identifies the target of the event.
4. Consider the identifier's scope and uniqueness. An identifier is not sufficient merely because it is unique somewhere in the system.
5. If no single identifier is sufficient, evaluate whether a composite identifier is required.

The agent should reason from the code and domain context. Do not assume that `id`, `entityId`, or a UUID is automatically the correct choice.

## Prefer the most atomic identifier

When several identifiers are available, prefer the one whose scope most closely matches the event.

For example, if a worker has multiple licenses:

```text
workerId=123
licenseId=1001
licenseId=1002
licenseId=1003
```

A log about one specific license should prefer `licenseId` over `workerId` because `licenseId` identifies the entity being processed at a finer granularity.

The goal is not the numerically smallest identifier. **Atomic** means the smallest relevant scope that uniquely identifies the entity or event.

Do not include broader identifiers merely because they exist. Add parent or contextual identifiers only when they answer a separate operational question or are required for uniqueness/correlation.

## Composite identifiers

Use a composite identifier only when no single identifier provides sufficient uniqueness within the relevant scope.

For example, if `licenseId` is only unique per worker, then:

```text
workerId=123 licenseId=456
```

may be required to identify the license unambiguously.

Do not treat several useful identifiers as a composite identifier automatically. A log containing `tenantId`, `workerId`, and `licenseId` is not necessarily using a composite identity; those values may simply provide additional context.

The key question is:

> Does the combination define the identity required to distinguish this entity or event?

If a single identifier is already sufficient, prefer it over a larger composite representation.

## When the target identifier does not exist yet

An entity may not have its own identifier at every point in its lifecycle.

For example, before a new license is persisted:

```text
workerId=123
licenseId=null
```

Do not invent a `licenseId` merely because the future entity will eventually have one.

At that point, use the closest meaningful existing identifier for the operation or parent entity, and preserve any existing request or correlation identifier when available.

After persistence, prefer the new, more atomic entity identifier for subsequent logs:

```text
requestId=abc-123 workerId=123 Creating license
requestId=abc-123 workerId=123 licenseId=987 License created
requestId=abc-123 licenseId=987 Processing license
```

The correct identifier can therefore change as the entity moves through its lifecycle.

## Existing correlation and tracing identifiers

Before generating a UUID, look for an existing identifier intended to correlate an operation, request, or trace.

Prefer an existing `traceId`, `requestId`, `correlationId`, or equivalent mechanism when it already represents the operation being logged. Do not create a redundant UUID for the same purpose.

Entity identifiers and correlation identifiers answer different questions:

- `workerId` — which worker?
- `licenseId` — which license?
- `requestId` / `correlationId` — which execution or operation?
- `traceId` — which distributed trace?

They may legitimately coexist when each provides distinct operational value.

## When a UUID is justified

Generate a UUID only when an identifier is genuinely needed and no suitable existing identifier or correlation mechanism exists.

A generated UUID is most useful for an operation, event, or execution that has no natural identity, such as:

- an internal operation without a request identifier;
- a newly created entity before persistence assigns its identity;
- an asynchronous task that needs an execution identity;
- an event that must be distinguished from other simultaneous events.

The UUID should be sufficiently unique for the scope in which it is used. Do not shorten or transform it merely for visual convenience if doing so reduces the identifier's uniqueness or interoperability.

## UUID lifecycle and propagation

A generated operation identifier should be created once for the relevant operation and reused by every log that belongs to that operation.

Avoid generating a new UUID at each method or layer:

```text
Controller -> UUID A
Service    -> UUID B
Repository -> UUID C
```

Prefer one operation identifier:

```text
Controller -> UUID A
Service    -> UUID A
Repository -> UUID A
```

When an operation crosses process or service boundaries, propagate the existing correlation or tracing identifier through the mechanism already used by the system, such as request headers, message metadata, or framework context. Do not invent a new propagation mechanism when the platform already provides one.

For asynchronous workflows, preserve the operation's identifier in the message metadata or established tracing context so downstream logs can be related to the originating operation.

## Decision flow

Use this order when reviewing a log:

```text
What is this event about?
        |
        v
What entity or operation does it identify?
        |
        v
Is there an existing identifier for that target?
   +----+----+
   |         |
  yes        no
   |         |
   v         v
Is it the   Is a composite
most atomic identifier required?
meaningful      |       |
identifier?   yes       no
   |           |         |
  yes          v         v
   |       use the     Use the closest
   |       minimum     meaningful context
   |       necessary   or operation identity
   |       combination
   |
   v
Use it
```

If an operation still needs an identity after these checks, look for an existing correlation/tracing identifier before generating a UUID.

## False positives to avoid

Do not report a problem solely because:

- a log uses a parent identifier while the child identifier does not exist yet;
- multiple identifiers are present and each has a distinct operational purpose;
- a UUID is used for an operation that genuinely has no natural identifier;
- an identifier is not globally unique when its documented scope is sufficient for the event;
- a project uses a domain-specific identifier whose meaning is not obvious from its name.

Require enough code or data-flow evidence to determine that the selected identifier is actually too broad, ambiguous, redundant, or unnecessary.

## Agent behavior

When reviewing a log:

1. Identify the event and the entity or operation it represents.
2. Inspect the surrounding code and domain model for available identifiers and relationships.
3. Select the most atomic meaningful identifier that uniquely identifies the target in its relevant scope.
4. Consider a composite identifier only when no single identifier is sufficient.
5. If the target has no identifier yet, use the closest meaningful existing context and preserve an existing correlation/tracing identifier when available.
6. Before recommending a UUID, verify that no suitable entity, request, correlation, or tracing identifier already exists.
7. If a UUID is required, ensure it is generated once for the relevant operation and propagated consistently.
8. Explain the reasoning when recommending a different identifier; do not flag identifiers based on naming alone.
