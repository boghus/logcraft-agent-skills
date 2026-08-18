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

## Expected behavior

Never log secret values. Prefer safe metadata, explicit allowlists, and redaction where diagnostic data is genuinely required.

Safe example:

```text
FTP credentials configured
```

For HTTP diagnostics, prefer method, route, status, duration, and a safe request identifier instead of headers or complete payloads.

## Severity guidance

- Critical: confirmed credential, token, or password disclosure.
- High: likely sensitive data exposure or complete request/response logging.
- Medium: potentially sensitive object logging that requires data-flow confirmation.
- Low: unnecessary contextual data with no clear sensitivity.

## False positives

Environment variable names and secret placeholders are not themselves secret values. Explicitly redacted values are acceptable.

## Technology

JavaScript, TypeScript, Astro, Node.js, browser code, GitHub Actions, shell scripts, HTTP clients.
