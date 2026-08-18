---
name: ci-context-rich-output
description: Review CI/CD output for useful, safe context that makes failures and deployments diagnosable without leaking secrets.
---

# CI context-rich output

## Problem

CI output often contains a final message such as `Deploy completed` without enough context to determine what was built, where it was deployed, or which commit produced it.

## Detection

For CI/CD workflows, inspect whether important build, test, and deploy results expose safe operational context such as:

- workflow/job/step
- environment
- branch or tag
- short commit SHA
- operation/result
- relevant endpoint or target name, when safe
- duration, when useful

Never include secret values merely to provide context.

## Expected behavior

Prefer concise, structured messages or summaries that answer: what ran, where, against which revision, and whether it succeeded.

Example:

```text
Deploy
Environment: staging
Branch: main
Commit: abc1234
Result: success
```

## Severity guidance

- High: missing context makes a production failure or deployment difficult to diagnose.
- Medium: useful context is missing but logs remain understandable.
- Low: cosmetic or redundant context improvements.

## False positives

Do not require every field in every step. Context should be proportional to the operation.

## Technology

GitHub Actions, shell scripts, CI/CD systems, Astro build pipelines.
