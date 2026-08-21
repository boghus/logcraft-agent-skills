---
name: log-amplification
description: Detect logging placed on high-frequency execution paths where a single event can generate unbounded or excessive log volume.
---

# Log amplification

## Problem

A log statement can be individually reasonable but operationally harmful when its surrounding code executes frequently. This is especially common in browser event handlers, observers, polling loops, and request hot paths.

## Detection

Inspect whether logging occurs inside or below:

- `MutationObserver` callbacks
- `scroll`, `resize`, `mousemove`, `input`, or keyboard handlers
- timers and intervals
- animation callbacks
- loops over large or externally sized collections
- polling/retry loops
- repeatedly invoked lifecycle hooks
- subscription callbacks
- per-request or per-item paths that can run at high volume

Before flagging, establish **both** the repetition mechanism and the operational context. Consider:

1. Is the code on a production hot path, or is it a bounded build/CLI/test operation?
2. Can the collection or invocation count grow with user input, traffic, repository size, or an external source?
3. Is the log emitted once per item/callback, or is it aggregated/bounded?
4. Is the output debug-only, sampled, rate-limited, or otherwise controlled?
5. Does one invalid item represent an actionable diagnostic that is intentionally reported individually during a finite operation?

Do not treat `log inside loop` as sufficient evidence of amplification. A finite build/content loader that reports one error per invalid input is not automatically a log-amplification finding.

Estimate whether one user action, request, page lifecycle, or build operation can trigger the log many times.

## Expected behavior

Prefer one **bounded** aggregated event over per-item or per-callback logs when the execution path can scale with traffic or untrusted/external input. Define both a maximum total number of events per operation and a serialized-byte budget for aggregated diagnostics. Chunking is permitted only while both limits remain within budget; when either limit is exceeded, truncate, sample, or rate-limit the output rather than continuing to emit additional chunks or events. If repeated diagnostics are genuinely required, recommend a controlled debug mode.

For finite build, CLI, migration, validation, or test operations, evaluate the maximum practical input size and whether per-item errors are part of the intended failure reporting before recommending aggregation.

## Example

```js
const observer = new MutationObserver((mutations) => {
  console.log(mutations)
})
```

This should be flagged because DOM mutation frequency is not bounded by the number of page loads, and the logged collection is not explicitly bounded.

By contrast:

```js
for (const item of buildItems) {
  if (!item.id) logger.error('Missing id')
}
```

is not automatically a finding. If `buildItems` is a finite build-time dataset and each invalid item is an actionable validation error, classify it as an accepted diagnostic unless there is evidence of excessive volume.

## Severity guidance

- High: potentially unbounded production log volume or client performance impact.
- Medium: repeated output with a predictable but significant frequency on a production path.
- Low: low-frequency callback where the risk is mostly noise.

Do not assign a severity when the evidence does not establish meaningful amplification.

## False positives

A log guarded by an explicit debug flag, sampling mechanism, or known low-frequency condition may be acceptable. Aggregated diagnostics are still subject to both the maximum total event count and serialized-byte budget.

Also treat finite build/CLI/test validation loops as potential false positives when the operation is bounded and per-item errors are intentional. Do not infer production traffic or unbounded input merely from the presence of a loop.

## Technology

JavaScript, TypeScript, browser APIs, Astro client scripts, Node.js event loops, build systems, CLI tooling.