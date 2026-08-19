# Anonymous external benchmark

This benchmark records observations from a second open-source Astro-based project audited with the six candidate LogCraft rules.

The source project is intentionally **not identified** here. Repository name, URLs, owners, commit SHAs, package names, and project-specific identifiers have been removed so the benchmark validates rule behavior rather than a particular repository.

## Audit result

| Rule | Result | Severity | Notes |
| --- | --- | --- | --- |
| `runtime-aware-logging` | contextual case | low | Node/CI test reporter uses `console.*`; runtime classification prevents a false positive |
| `log-amplification` | no finding | — | no confirmed high-frequency logging path |
| `ci-context-rich-output` | finding | medium | important CI operations rely on raw output without consistent operational context |
| `github-actions-summary` | finding | medium | important results are not consistently surfaced through `$GITHUB_STEP_SUMMARY` |
| `verbose-output` | no finding | — | no permanently enabled diagnostic verbosity confirmed |
| `secret-safe-output` | no finding | — | no confirmed secret value disclosure |

## Interpretation

The benchmark is intentionally conservative:

- absence of `$GITHUB_STEP_SUMMARY` alone is not treated as a defect; the finding requires an important result that would materially benefit from a concise summary;
- `console.*` in a test reporter is not treated as a browser logging problem when the execution context is clearly Node/CI;
- secret environment variable names and placeholders are not treated as leaked values;
- repetitive output is not considered log amplification unless the execution frequency creates a meaningful volume risk.

The fixtures below are sanitized behavioral equivalents of the observed cases. They are not copies of the audited project's source.
