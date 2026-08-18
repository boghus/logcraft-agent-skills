---
name: github-actions-summary
description: Prefer concise GitHub Actions summaries and annotations for important results instead of flooding workflow logs with repetitive output.
---

# GitHub Actions summary

## Problem

Raw workflow output is useful for diagnostics but can become noisy when a command emits a large list of files, verbose protocol details, or repetitive status lines.

## Detection

Look for:

- permanently verbose CLI flags
- large file synchronization output
- repeated success messages
- important results communicated only through many raw lines
- deployment/build outcomes without a concise summary

This skill focuses on **presentation and aggregation in GitHub Actions**. Use `ci-context-rich-output` when the problem is missing operational context such as environment, revision, operation, or result. The two skills may apply together, but they should not require the same change for the same reason.

## Expected behavior

Use GitHub Actions features such as `$GITHUB_STEP_SUMMARY` for human-readable results. Use workflow annotations when a warning or error should be surfaced directly. Keep raw verbose output available for troubleshooting when it is useful.

A summary should contain only safe, decision-relevant information, for example:

```text
### Staging deploy
- Environment: staging
- Commit: abc1234
- Build: success
- Deploy: success
```

Any diagnostic or verbose output kept for troubleshooting must exclude secrets and sensitive data through an explicit allowlist, masking, or redaction, including output produced by failed steps.

## Severity guidance

- High: critical failure/deployment information is effectively hidden by output volume.
- Medium: substantial noise makes troubleshooting unnecessarily difficult.
- Low: a summary would improve readability but raw output is still manageable.

## False positives

Do not flag verbose output during an explicitly diagnostic workflow or a failed step where the extra output is the primary debugging artifact. The diagnostic output must still be secret-safe.

## Technology

GitHub Actions, GitHub annotations, `$GITHUB_STEP_SUMMARY`, shell/CLI tooling.
