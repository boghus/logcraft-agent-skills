---
name: secret-safe-output
description: Detect and prevent secrets or sensitive values from being exposed through application, CI, or deployment logs.
---

# Secret-safe output

## Problem

Logs can accidentally disclose credentials, tokens, cookies, authorization headers, personal data, or complete API responses.

## Detection

Inspect logging and CI output for:

- passwords
- API keys and access tokens
- cookies and session identifiers
- Authorization headers
- secret environment variables
- private URLs containing credentials
- complete request or response objects
- personal or client-sensitive data

Treat indirect logging as a risk too, such as serializing an object that contains a sensitive field.

Require evidence of a **data-flow from a sensitive value to an output sink** before reporting a confirmed leak. Names such as `token`, `password`, `secret`, or `apiKey` are signals for investigation, not proof that the value is actually secret or emitted.

Trace at least this chain where practical:

`source → transformation/object/property → logger or CI output sink`

For structured objects, verify that the sensitive property is included in the serialized or logged value. For environment variables, distinguish the variable name from the secret value stored in it.

## Expected behavior

Never log secret values. Prefer safe metadata, explicit allowlists, and redaction where diagnostic data is genuinely required.

Safe example:

```text
FTP credentials configured
```

For HTTP diagnostics, prefer method, route, status, duration, and a safe request identifier instead of headers or complete payloads.

## Severity guidance

- Critical: confirmed credential, token, or password disclosure.
- High: likely sensitive data exposure or complete request/response logging with confirmed sensitive fields.
- Medium: potentially sensitive object logging where the data-flow is plausible but not fully confirmed.
- Low: unnecessary contextual data with no clear sensitivity.

Do not assign Critical/High solely from a sensitive-looking variable name without evidence that the value reaches an output sink.

## False positives

Environment variable names and secret placeholders are not themselves secret values. Explicitly redacted values are acceptable.

A variable such as `token` that is only used for control flow, passed to a non-output API, or replaced with a constant safe label is not a secret-output finding. Likewise, configuration code that reads a secret without logging it is not a disclosure.

## Technology

JavaScript, TypeScript, Astro, Node.js, browser code, GitHub Actions, shell scripts, HTTP clients.
