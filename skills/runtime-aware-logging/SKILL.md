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
- tests and local development tooling

For Astro, inspect `<script>` blocks, imported client scripts, server-only modules, endpoints, framework configuration, CLI entrypoints, build/content loaders, and integrations before classifying the runtime.

When a project has a logging abstraction, determine whether `console.*` is being used as the abstraction's destination/transport. A `console.error()` inside a logger implementation is not equivalent to an application directly logging sensitive or noisy data.

## Expected behavior

Do not recommend server logging mechanisms for browser code. Do not require request IDs or server correlation IDs when there is no server request lifecycle. For client code, consider whether a production telemetry mechanism exists before suggesting `console.*` as an observability strategy.

Do not flag a logger implementation merely because its destination writes to `console.*`. Evaluate the caller, destination, level filtering, and runtime together.

## Examples

Potentially misleading recommendation:

```js
console.error(error)
```

in a browser-only Astro script, followed by advice to search server logs.

Correct analysis:

> This code executes in the browser. `console.error` is local browser output and is not equivalent to centralized application logging.

Also correct:

```ts
const destination = {
  write(event) {
    console.error(event.message)
  }
}
```

when this code is the implementation of an explicit server-side logger destination. The sink itself is not a runtime violation.

## Severity guidance

- High: logging recommendation would expose secrets or create false operational assumptions.
- Medium: logging is valid but targets the wrong runtime or observability destination.
- Low: context classification is missing but no immediate harm exists.

## False positives

Do not flag intentional build diagnostics or explicit development-only browser diagnostics merely because they use `console.*`.

Do not flag `console.*` inside a documented logging destination/adapter without evidence that the destination itself is unsafe. Do not infer browser execution solely from the use of `console.*`.

## Technology

Astro, JavaScript, TypeScript, Node.js, browser JavaScript, GitHub Actions.
