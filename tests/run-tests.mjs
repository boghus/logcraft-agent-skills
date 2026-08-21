#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const EXPECTATIONS = resolve(ROOT, 'tests/expected-findings.yml');
const FIXTURES = resolve(ROOT, 'tests/fixtures');
const DEFAULT_ANALYZER = resolve(ROOT, 'tests/deterministic-analyzer.mjs');

function parseExpectations(text) {
  const cases = [];
  let currentCase = null;
  let currentFinding = null;
  let inFindings = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const caseMatch = /^  - id:\s*(.+)$/.exec(line);
    if (caseMatch) {
      if (currentFinding && currentCase) currentCase.findings.push(currentFinding);
      if (currentCase) cases.push(currentCase);
      currentCase = { id: caseMatch[1].trim(), fixture: null, findings: [] };
      currentFinding = null;
      inFindings = false;
      continue;
    }

    if (!currentCase) continue;

    const fixtureMatch = /^    fixture:\s*(.+)$/.exec(line);
    if (fixtureMatch) {
      currentCase.fixture = fixtureMatch[1].trim();
      continue;
    }

    if (/^    findings:\s*$/.test(line)) {
      inFindings = true;
      continue;
    }

    if (!inFindings) continue;

    const ruleMatch = /^      - rule:\s*(.+)$/.exec(line);
    if (ruleMatch) {
      if (currentFinding) currentCase.findings.push(currentFinding);
      currentFinding = { rule: ruleMatch[1].trim(), expected: null, severity: null, reason: null };
      continue;
    }

    if (!currentFinding) continue;

    const severityMatch = /^        severity:\s*(.+)$/.exec(line);
    if (severityMatch) {
      currentFinding.severity = severityMatch[1].trim();
      continue;
    }

    const expectedMatch = /^        expected:\s*(true|false)$/.exec(line);
    if (expectedMatch) {
      currentFinding.expected = expectedMatch[1] === 'true';
      continue;
    }

    const reasonMatch = /^        reason:\s*(.+)$/.exec(line);
    if (reasonMatch) currentFinding.reason = reasonMatch[1].trim();
  }

  if (currentFinding && currentCase) currentCase.findings.push(currentFinding);
  if (currentCase) cases.push(currentCase);
  return cases;
}

function validateContract(cases) {
  const errors = [];
  const ids = new Set();

  if (cases.length === 0) errors.push('contract must contain at least one test case');

  for (const testCase of cases) {
    if (!testCase.id) errors.push('case without id');
    if (ids.has(testCase.id)) errors.push(`duplicate case id: ${testCase.id}`);
    ids.add(testCase.id);

    if (!testCase.fixture) {
      errors.push(`${testCase.id}: missing fixture`);
    } else {
      const fixturePath = resolve(FIXTURES, testCase.fixture.replace(/^fixtures\//, ''));
      if (!existsSync(fixturePath)) errors.push(`${testCase.id}: fixture not found: ${testCase.fixture}`);
    }

    if (testCase.findings.length === 0) errors.push(`${testCase.id}: no findings declared`);

    for (const finding of testCase.findings) {
      if (!finding.rule) errors.push(`${testCase.id}: finding without rule`);
      if (finding.expected === null) errors.push(`${testCase.id}/${finding.rule}: missing expected boolean`);
      if (!finding.reason) errors.push(`${testCase.id}/${finding.rule}: missing reason`);
    }
  }

  return errors;
}

function runAnalyzer(cases) {
  const analyzer = process.env.LOGCRAFT_ANALYZER;
  const command = analyzer ? analyzer : process.execPath;
  const commandArgs = analyzer ? [] : [DEFAULT_ANALYZER];
  const results = [];

  for (const testCase of cases) {
    for (const finding of testCase.findings) {
      const fixturePath = resolve(FIXTURES, testCase.fixture.replace(/^fixtures\//, ''));
      try {
        const output = execFileSync(command, [...commandArgs, '--rule', finding.rule, '--fixture', fixturePath], { encoding: 'utf8' }).trim();
        const actual = JSON.parse(output);
        const passed = actual.finding === finding.expected && (!finding.severity || actual.severity === finding.severity);
        results.push({ testCase, finding, passed, actual });
      } catch (error) {
        results.push({ testCase, finding, passed: false, actual: null, error: error.message });
      }
    }
  }

  return results;
}

if (!existsSync(EXPECTATIONS)) {
  console.error(`FAIL: missing ${EXPECTATIONS}`);
  process.exit(1);
}

const cases = parseExpectations(readFileSync(EXPECTATIONS, 'utf8'));
const contractErrors = validateContract(cases);
const assertions = cases.reduce((total, testCase) => total + testCase.findings.length, 0);

console.log('LogCraft contract tests');
console.log('');
console.log(`Cases: ${cases.length}`);
console.log(`Assertions: ${assertions}`);
console.log('');

if (contractErrors.length > 0) {
  console.error('CONTRACT VALIDATION: FAIL');
  for (const error of contractErrors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('CONTRACT VALIDATION: PASS');
console.log('All fixtures and golden expectations are structurally valid.');

const analyzerResults = runAnalyzer(cases);
const failures = analyzerResults.filter((result) => !result.passed);
console.log('');
console.log(`ANALYZER: ${failures.length === 0 ? 'PASS' : 'FAIL'}`);
console.log(`Engine: ${process.env.LOGCRAFT_ANALYZER ?? 'built-in deterministic analyzer'}`);

for (const result of analyzerResults) {
  const status = result.passed ? '✓' : '✗';
  const expected = `${result.finding.expected}${result.finding.severity ? `/${result.finding.severity}` : ''}`;
  const actual = result.actual ? `${result.actual.finding}${result.actual.severity ? `/${result.actual.severity}` : ''}` : 'error';
  console.log(`${status} ${result.testCase.id}/${result.finding.rule} expected=${expected} actual=${actual}`);
}

if (failures.length > 0) process.exit(1);
