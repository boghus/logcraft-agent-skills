# LogCraft rule tests

This directory contains deterministic fixtures, golden expectations, and a dependency-free contract test runner for the candidate logging rules.

## Purpose

The tests define the behavior expected from each rule. Each case in `expected-findings.yml` specifies:

- the fixture to analyze;
- the rule that should or should not match;
- the expected severity when applicable;
- the reason for the expected result.

## Running the tests

The contract runner requires only Node.js and has no npm dependencies:

```bash
node tests/run-tests.mjs
```

The runner validates the contract and then executes the built-in deterministic analyzer against every assertion. This makes the CI test meaningful without depending on an AI provider, network service, or non-deterministic model output.

An external analysis engine can replace the built-in analyzer through `LOGCRAFT_ANALYZER`. The executable must accept `--rule <rule>` and `--fixture <path>` and return JSON containing at least `finding: true|false`; it may also return `severity` for severity assertions.

Example interface:

```text
LOGCRAFT_ANALYZER=./bin/logcraft-analyzer node tests/run-tests.mjs
```

The built-in analyzer is intentionally small and deterministic. It validates the patterns represented by the current contract fixtures; it is not intended to replace the AI-agent skills or serve as a general-purpose static-analysis engine.

## Context-aware regression tests

The Astro benchmark showed that syntax alone is not enough to classify a logging pattern. The suite therefore includes explicit negative controls for:

- `console.*` used as the sink of a logger destination;
- per-item errors in a finite build/content validation loop;
- a secret environment variable that is read but never emitted;
- normal command output without an explicit verbose/debug flag.

These cases protect against regressions where LogCraft reports a finding solely because it sees `console.error`, a loop, a secret-looking variable, or ordinary CLI output.

## Anonymous real-world validation cases

The `fixtures/anonymous-static-site/` fixtures are reduced, non-secret reproductions of patterns derived from a real-world project. They intentionally do not contain real credentials or repository-specific secrets.

A second external open-source project was audited using the same six candidate rules. Its findings are recorded under `benchmarks/anonymous-project/`, with sanitized behavioral fixtures under `fixtures/benchmarks/anonymous-project/`. The project identity, URLs, owners, commit SHAs, and project-specific identifiers are intentionally omitted.

The existing anonymous static-site cases validate:

- `verbose-output` for `lftp --verbose` and `curl --verbose`;
- `secret-safe-output` for verbose FTP diagnostics with credential variables;
- `github-actions-summary` for unstructured deployment output;
- `ci-context-rich-output` for missing structured deployment context.

The external anonymous benchmark additionally validates:

- runtime classification for a Node/CI test reporter;
- absence of confirmed log amplification on normal test callbacks;
- missing operational context in ordinary CI jobs;
- missing GitHub Actions summaries for important CI results;
- absence of permanently enabled verbose diagnostics;
- conservative handling of secret-safe output when no secret value is exposed;
- a positive control where `$GITHUB_STEP_SUMMARY` already provides concise deployment context.

## Test philosophy

A positive fixture should represent a concrete rule violation. A negative fixture should represent an explicit false-positive case from the corresponding skill definition.

The runner separates **contract validation** from **analysis execution**, but both now run by default. Contract validation checks the test data itself; the built-in deterministic analyzer checks the behavior represented by the current fixtures. An external analyzer can be supplied later without changing the contract format.
