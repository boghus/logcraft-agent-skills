---
name: runtime-aware-logging
description: Determine where code executes before recommending or evaluating application logging, especially in Astro projects.
---

# Runtime-aware logging

## Problem

The same logging statement has different operational consequences depending on where code runs. A browser `console.error`, an Astro build-time message, a server-side log, and GitHub Actions output are not interchangeable.

## Detection

Identify the execution context before evaluating a log:

- Astro build-time code
- Astro server/SSR code
- Astro API/endpoints
- Browser/client-side scripts
- GitHub Actions/CI shell commands
- Deployment tooling

For Astro, inspect `<script>` blocks, imported client scripts, server-only modules, endpoints, and framework configuration before classifying the runtime.

## Expected behavior

Do not recommend server logging mechanisms for browser code. Do not require request IDs or server correlation IDs when there is no server request lifecycle. For client code, consider whether a production telemetry mechanism exists before suggesting `console.*` as an observability strategy.

## Examples

Potentially misleading recommendation:

```js
console.error(error)
```

in a browser-only Astro script, followed by advice to search server logs.

Correct analysis:

> This code executes in the browser. `console.error` is local browser output and is not equivalent to centralized application logging.

## Severity guidance

- High: logging recommendation would expose secrets or create false operational assumptions.
- Medium: logging is valid but targets the wrong runtime or observability destination.
- Low: context classification is missing but no immediate harm exists.

## False positives

Do not flag intentional build diagnostics or explicit development-only browser diagnostics merely because they use `console.*`.

## Technology

Astro, JavaScript, TypeScript, Node.js, browser JavaScript, GitHub Actions.
