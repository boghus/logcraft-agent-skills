# LogCraft rule tests

This directory contains deterministic fixtures and golden expectations for the candidate logging rules.

## Purpose

The tests define the behavior expected from each rule before a runtime/CLI implementation exists. They are intended to be usable by an AI coding agent today and by an automated LogCraft runner later.

Each case in `expected-findings.yml` specifies:

- the fixture to analyze;
- the rule that should or should not match;
- the expected severity when applicable;
- the reason for the expected result.

## Anonymous real-world validation case

The `fixtures/anonymous-static-site/` fixtures are reduced, non-secret reproductions of patterns derived from a real-world project. They intentionally do not contain real credentials or repository-specific secrets.

The MSP cases validate:

- `verbose-output` for `lftp --verbose` and `curl --verbose`;
- `secret-safe-output` for verbose FTP diagnostics with credential variables;
- `github-actions-summary` for unstructured deployment output;
- `ci-context-rich-output` for missing structured deployment context.

## Test philosophy

A positive fixture should represent a concrete rule violation. A negative fixture should represent an explicit false-positive case from the corresponding skill definition.

These are **contract tests**, not a parser or static-analysis engine. The execution mechanism belongs to the future LogCraft runner.
