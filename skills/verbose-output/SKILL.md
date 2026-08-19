---
name: verbose-output
description: Detect permanently enabled verbose CLI output and distinguish normal operational output from diagnostic verbosity.
---

# Verbose output

## Problem

Flags such as `--verbose`, `-v`, `--debug`, `curl --verbose`, or equivalent shell tracing can produce excessive output, expose infrastructure details, and obscure the useful failure message.

## Detection

Inspect CI/CD and scripts for:

- `--verbose` / `-v`
- `--debug`
- `set -x`
- protocol-level diagnostics enabled by default
- recursive/file-by-file output during normal deploys

For short or ambiguous flags such as `-v`, first identify the relevant CLI command and verify from its documented or observable option semantics that the flag actually enables verbosity. Do not assume `-v` universally means verbose output.

Consider whether the command runs on every build/deploy or only in a diagnostic path.

## Expected behavior

Normal execution should be concise. Diagnostic verbosity should be opt-in or enabled only for a troubleshooting workflow. Preserve enough output to identify the command and failure without dumping unnecessary internals.

Any diagnostic or verbose exception must still exclude secrets and sensitive data through an explicit allowlist, masking, or redaction, including when a step fails.

## Example

```yaml
- run: curl --verbose https://example.test/health
```

If this runs on every CI execution, recommend a quiet default plus a dedicated diagnostic mode.

## Severity guidance

- High: verbose output can expose credentials, headers, internal URLs, or other sensitive infrastructure details.
- Medium: excessive output materially hurts CI readability or performance.
- Low: minor unnecessary verbosity.

## False positives

Do not flag explicit troubleshooting workflows, commands where verbose output is required to capture a failure, or temporary diagnostics that are clearly scoped and documented. Still require secret-safe output for those diagnostic paths.

## Technology

GitHub Actions, Bash, shell CLIs, curl, lftp, npm and other build/deploy tooling.
