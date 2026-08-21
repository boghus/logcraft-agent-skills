# logcraft-agent-skills

Candidate logging skills and production-oriented logging practices for AI coding agents that help develop, review, and improve software.

🇬🇧 **English** · 🇪🇸 [Español](README.es.md) · 🇧🇷 [Português (Brasil)](README.pt-BR.md)

## What is LogCraft?

LogCraft helps AI agents make better logging decisions. It does not only detect `console.log`: it analyzes execution context, frequency, data sensitivity, and the operational environment before recommending changes.

The goal is to produce useful logs for diagnosing production problems without creating noise, security risks, or unnecessary complexity.

## Candidate logging rules

This repository currently defines six candidate rules derived from a logging audit of an Astro + JavaScript static site and its GitHub Actions pipelines:

1. `runtime-aware-logging` — classify execution context before recommending logging.
2. `log-amplification` — detect logs inside high-frequency callbacks and repeated execution paths.
3. `ci-context-rich-output` — require useful, safe context in CI/CD output.
4. `github-actions-summary` — prefer concise GitHub Actions summaries over excessive raw output.
5. `verbose-output` — detect permanently enabled verbose CLI output and recommend diagnostic-only verbosity.
6. `secret-safe-output` — prevent secrets and sensitive values from being exposed through logs.

These are **candidate skills**, not automatic mandates. Each rule is context-aware and should avoid recommending logging where the runtime or architecture does not justify it.

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

The candidate rules include deterministic contract tests under [`tests/`](tests/). They contain positive and negative fixtures plus golden expectations, including reduced reproductions of logging patterns found in MSP Energia.

Run the dependency-free contract validation with:

```bash
node tests/run-tests.mjs
```

The runner validates fixture coverage and expectation structure. A future or external LogCraft analyzer can be plugged into the same runner through `LOGCRAFT_ANALYZER` without coupling the tests to a specific AI provider or parser.

## Project status

The current skills are candidate rules evolving through real-world cases. The repository is used to validate which recommendations are generalizable and which need to be adapted to specific technologies.

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

Rules should avoid universal recommendations when technical context changes their validity.

## Philosophy

> LogCraft does not aim to find `console.log`. It aims to understand when, where, and why a log can be useful, dangerous, or noise.

## License

See the LICENSE file for the applicable terms of use and contribution.
