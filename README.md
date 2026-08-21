# logcraft-agent-skills

Candidate logging skills and production-oriented logging practices for AI coding agents that help develop, review, and improve software.

🇬🇧 **English** · 🇪🇸 [Español](README.es.md) · 🇧🇷 [Português (Brasil)](README.pt-BR.md)

## What is LogCraft?

LogCraft helps AI agents make better logging decisions. It does not only detect `console.log`: it analyzes execution context, frequency, data sensitivity, and the operational environment before recommending changes.

The goal is to produce useful logs for diagnosing production problems without creating noise, security risks, or unnecessary complexity.

## Rules

This repository contains context-aware logging rules for common runtime, CI/CD, verbosity, log-volume, and secret-safety scenarios:

- `runtime-aware-logging` — classify execution context before recommending logging.
- `log-amplification` — detect logs inside high-frequency callbacks and repeated execution paths.
- `ci-context-rich-output` — require useful, safe context in CI/CD output.
- `github-actions-summary` — prefer concise GitHub Actions summaries over excessive raw output.
- `verbose-output` — detect permanently enabled verbose CLI output and recommend diagnostic-only verbosity.
- `secret-safe-output` — prevent secrets and sensitive values from being exposed through logs or command output.

These are **context-aware rules**, not automatic mandates. Each rule should be evaluated against the runtime, execution path, data sensitivity, and operational purpose before recommending a change.

## Logging design guidance

LogCraft also provides design guidance for deciding whether a log should exist before recommending how to implement it:

- `logging-design-guidance` — decide whether an event has enough operational value to justify a log, while considering runtime, frequency, existing observability, and data sensitivity.

The guidance is intentionally principle-based. It should help an AI agent reason about the operational question a log needs to answer instead of prescribing a log for every code path.

## Principles

- **Context before quantity:** a log should help explain what happened and why.
- **Runtime matters:** a recommendation valid for a backend can be incorrect for browser code or build-time code.
- **Security first:** never log secrets, credentials, tokens, or unnecessary sensitive information.
- **Avoid noise:** high-frequency logs can degrade performance and make diagnosis harder.
- **Observability appropriate to the environment:** build, application, browser, and CI/CD have different needs.

## Contexts

LogCraft distinguishes contexts such as:

```text
Astro build
Astro server / SSR
Browser / client-side
GitHub Actions
Deploy / infrastructure
```

This prevents backend-oriented rules from being applied automatically to static projects or browser-executed code.

## Example

A `console.log()` inside a `MutationObserver`, a `scroll` listener, or a `setInterval` should not be evaluated the same way as a log executed once during a build.

LogCraft aims to detect that difference and explain the risk before recommending a modification.

## Validation tests

The rules include deterministic contract tests under [`tests/`](tests/). They contain positive and negative fixtures plus golden expectations, including reduced reproductions of logging patterns found in MSP Energia.

Run the dependency-free contract validation with:

```bash
node tests/run-tests.mjs
```

The runner performs two validation stages:

1. **Contract validation** checks fixture coverage and golden expectation structure.
2. **Analyzer validation** runs the built-in deterministic analyzer when configured by the test suite, or an external analyzer through `LOGCRAFT_ANALYZER` when one is supplied.

The contract tests keep rule behavior reproducible without coupling the project to a specific AI provider or parser.

The fixtures also cover security-sensitive output. For example, an explicit secret expansion such as `$FTP_PASSWORD`, `${FTP_PASSWORD}`, or `process.env.FTP_PASSWORD` reaching a direct output sink is treated independently from credential-flow analysis and can produce a high-severity finding.

## Project status

The current rules and guidance are evolving through real-world cases. The repository is used to validate which recommendations are generalizable and which need to be adapted to specific technologies.

## Documentation

- [Español](README.es.md)
- [Português (Brasil)](README.pt-BR.md)

## Contributing

New rules should explain:

1. what problem they solve;
2. how to detect the problem;
3. the expected behavior;
4. relevant false positives;
5. the technologies or runtimes where they apply.

Design guidance should explain the decision criteria, useful exceptions, and relevant context rather than turning contextual recommendations into universal mandates.

Rules should avoid universal recommendations when technical context changes their validity.

## Philosophy

> LogCraft does not aim to find `console.log`. It aims to understand when, where, and why a log can be useful, dangerous, or noise.

## License

See the LICENSE file for the applicable terms of use and contribution.
