# Log frequency

## Principle

Evaluate repeated logs according to the information each repetition contributes and the logging level used.

Do not treat every repeated log as a problem, and do not treat a loop, batch, or retry as an automatic finding.

A repeated log is useful when each occurrence provides meaningful new operational or diagnostic information. Repetition becomes a concern when equivalent messages can execute frequently without adding useful information.

## Level-aware evaluation

Evaluate frequency together with the log level.

### INFO

INFO is primarily operational context. Repeated INFO messages should provide meaningful progress, state changes, or distinct outcomes.

Frequent per-item INFO messages can create operational noise when the same information could be represented by a summary or a meaningful progress event.

### DEBUG

DEBUG can contain more frequent diagnostic detail. Repetition may be justified when each occurrence helps explain processing behavior, retries, bottlenecks, or optimization opportunities.

DEBUG is not automatically unlimited. Report a frequency risk when repeated DEBUG output adds no meaningful diagnostic value or can become excessive at runtime.

## Repetition context

When a repeated log is found, evaluate:

- what causes the repetition;
- whether each occurrence represents a distinct event or repeats the same state;
- whether each occurrence adds meaningful new information;
- the observable unit being processed, such as an operation, entity, batch, retry, or iteration;
- the logging level used;
- whether the available code provides evidence that runtime frequency can become significant.

Do not require a fixed numeric threshold. Use evidence from the implementation and execution context rather than inventing a universal maximum.

## False positives to avoid

Do not report a finding solely because a log appears inside:

- a loop;
- a batch;
- a retry;
- an asynchronous callback;
- a frequently called method.

A repeated log may be intentional and useful when each occurrence represents a distinct event or contributes new information.

## Agent behavior

When reviewing repeated logs:

1. Identify why the log can repeat.
2. Evaluate the repetition together with its logging level.
3. Determine whether each occurrence adds meaningful new information.
4. Report a risk only when the implementation provides evidence that repetition can create noise or excessive output without sufficient value.
5. Do not apply a universal count threshold.
6. Do not automatically recommend summarization or removal; first establish that the repeated information is unnecessarily redundant.
