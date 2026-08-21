# Traceability

## Principle

Traceability is the ability to correlate related events belonging to the same operation as it moves through observable components, processes, or systems.

Evaluate the traceability of the flow that can be observed from the available code and context. Do not assume that the complete architecture, every downstream component, or every possible outcome is visible.

Preserve and propagate existing traceability context when an operation continues. Do not invent relationships when the available evidence cannot establish them.

## Identify the observable operation

Before evaluating traceability:

1. Identify the operation, execution, or flow represented by the events under review.
2. Determine the observable entry point and the components, processes, systems, or SDK boundaries visible in the available context.
3. Identify the traceability context already associated with the operation.
4. Distinguish the operation's identity from the identities of entities, events, or individual attempts.
5. Identify the observable outcomes without assuming that all possible outcomes are known.

The goal is to determine whether related events can be connected, not to reconstruct an architecture that is outside the available evidence.

## Preserve existing traceability context

When an operation continues, prefer the existing tracing or correlation context already used by the system.

Examples of context may include:

```text
trace_id
request_id
correlation_id
operation_id
```

The exact mechanism is environment-specific. Do not prescribe a transport or technology when the implementation context does not establish one.

If a component or system uses a different identifier for a legitimate architectural reason, determine whether the relationship to the previous context remains observable. Different identifier values do not by themselves prove a traceability break.

## Distinguish operation, entity, and attempt identity

Different identifiers can legitimately coexist because they represent different scopes:

```text
operation_id = ABC
entity_id    = 123
attempt_id   = 001
```

For example, an operation may be retried:

```text
operation_id=ABC attempt_id=001 -> failure
operation_id=ABC attempt_id=002 -> success
```

The operation remains traceable while each attempt can be distinguished independently.

Do not require every event in every component to use the same identifier value. Require the relationship between related identifiers to remain understandable when identifiers change scope or representation.

## Propagate across boundaries

When an operation crosses a component, process, SDK, or system boundary, evaluate whether its traceability context continues across that boundary.

Conceptually:

```text
Component A
context=ABC
    |
    v
System B
context=ABC
    |
    v
SDK
context=ABC
```

The propagation mechanism depends on the environment. It may use an existing request context, message metadata, execution context, SDK mechanism, or another established convention.

Do not introduce a new propagation mechanism when the environment already provides one.

## Detect traceability breaks

A possible break exists when an operation continues but the available context no longer provides a demonstrable relationship to the preceding operation.

For example:

```text
Component A -> operation_id=123
Component B -> operation_id=xyz
```

Different identifiers are not enough to report a problem. First determine whether:

- `xyz` intentionally represents a new scope;
- `xyz` is related to `123` through another observable identifier;
- the system documents or implements an explicit parent/child relationship;
- the identifiers are transformations of the same context;
- the available evidence is insufficient to establish the relationship.

Report a traceability issue only when the evidence supports a real or likely loss of correlation.

## When traceability breaks

If a relationship appears to be broken:

1. Report the observable break and the evidence supporting it.
2. Recommend correcting the propagation when the code and available context provide enough evidence that the same operation should remain correlated.
3. If the architecture or external boundary cannot be verified, do not invent a relationship or assume the downstream behavior.
4. Preserve the traceability information that is still observable in logs when removing or suppressing it would make diagnosis harder.
5. If different identifiers must coexist, recommend recording their relationship when that relationship is known and operationally useful.

A traceability problem is an observability concern by default. Do not recommend aborting an operation solely because logging or trace context is incomplete unless the available system contract explicitly makes traceability a required condition for continuing.

## Preserve evidence without inventing relationships

When the relationship between identifiers cannot be established, preserve what is known without claiming that two identifiers represent the same operation.

For example:

```text
upstream_operation_id=123
downstream_operation_id=xyz
```

may be more useful than dropping one of the identifiers, provided both values are safe to log and their distinct scopes are clear.

Do not transform an uncertain relationship into a false correlation just to make the logs easier to search.

## Reconstructability

The final question is:

> Can an operator use the available context to reconstruct the observable portion of the operation?

If not, identify where the relationship becomes ambiguous or disappears and explain what context would restore the missing link.

Traceability does not require complete knowledge of the system. It requires enough preserved relationships to follow the operation through the portion of the flow that is observable.

## False positives to avoid

Do not report a traceability problem solely because:

- different components use different identifier values;
- a new identifier represents a legitimate child operation or attempt;
- the complete downstream architecture is not visible in the repository;
- a boundary uses an established mechanism that is not obvious from the log statement alone;
- an operation has multiple valid outcomes;
- a trace identifier is not the same as an entity identifier.

Require evidence from code, data flow, configuration, contracts, or established runtime mechanisms before asserting that traceability is broken.

## Agent behavior

When reviewing logging and traceability:

1. Identify the observable operation and its entry point.
2. Identify existing trace or correlation context.
3. Distinguish operation, entity, and attempt identities.
4. Follow the context through observable components, processes, systems, and SDK boundaries.
5. Determine whether identifier changes preserve an observable relationship.
6. Report likely breaks only when supported by evidence.
7. Recommend propagation or correction when the intended relationship is sufficiently established.
8. When the relationship cannot be established, preserve observable evidence without inventing a correlation.
9. Do not recommend aborting solely because traceability is incomplete unless the available contract explicitly requires it.
10. State the limits of what can be concluded when part of the flow is outside the available context.
