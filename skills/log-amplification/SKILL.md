---
name: log-amplification
description: Detect logging placed on high-frequency execution paths where a single event can generate unbounded or excessive log volume.
---

# Log amplification

## Problem

A log statement can be individually reasonable but operationally harmful when its surrounding code executes frequently. This is especially common in browser event handlers and observers.

## Detection

Inspect whether logging occurs inside or below:

- `MutationObserver` callbacks
- `scroll`, `resize`, `mousemove`, `input`, or keyboard handlers
- timers and intervals
- animation callbacks
- loops over large collections
- polling/retry loops
- repeatedly invoked lifecycle hooks
- subscription callbacks

Estimate whether one user action, page lifecycle, or build operation can trigger the log many times.

## Expected behavior

Prefer one **bounded** aggregated event over per-item or per-callback logs. Define a maximum item count or serialized byte budget for aggregated diagnostics. If the budget is exceeded, truncate, chunk, sample, or rate-limit the output rather than emitting an unbounded event. If repeated diagnostics are genuinely required, recommend a controlled debug mode.

Do not automatically remove logging solely because it is inside a callback; assess expected frequency first.

## Example

```js
const observer = new MutationObserver((mutations) => {
  console.log(mutations)
})
```

This should be flagged because DOM mutation frequency is not bounded by the number of page loads, and the logged collection is not explicitly bounded.

## Severity guidance

- High: potentially unbounded production log volume or client performance impact.
- Medium: repeated output with a predictable but significant frequency.
- Low: low-frequency callback where the risk is mostly noise.

## False positives

A log guarded by an explicit debug flag, sampling mechanism, or known low-frequency condition may be acceptable. Aggregated diagnostics are still subject to the item/byte budget.

## Technology

JavaScript, TypeScript, browser APIs, Astro client scripts, Node.js event loops.
