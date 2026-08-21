#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const rule = args.get('--rule');
const fixture = args.get('--fixture');

if (!rule || !fixture) {
  console.error('Usage: deterministic-analyzer.mjs --rule <rule> --fixture <path>');
  process.exit(2);
}

const source = readFileSync(fixture, 'utf8');

function result(finding, severity) {
  const output = { finding };
  if (severity) output.severity = severity;
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

function analyzeRuntimeAware() {
  const browserScript = /<script[\s\S]*console\.(log|warn|error|debug)/i.test(source);
  const loggerDestination = /write\s*\([^)]*event[^)]*\)\s*\{[\s\S]*console\.error\(\s*event\.message/i.test(source);
  result(browserScript && !loggerDestination, browserScript && !loggerDestination ? 'low' : undefined);
}

function analyzeLogAmplification() {
  const observerLogging = /mutationobserver[\s\S]*console\.(log|warn|error|debug)/i.test(source);
  const boundedSampling = /slice\s*\(\s*0\s*,\s*\d+\s*\)[\s\S]*console\.debug/i.test(source);
  const finiteBuildValidation = /array\.from\s*\(\s*items\s*\)[\s\S]*for\s*\(\s*const\s+item\s+of\s+finiteitems/i.test(source);
  result(observerLogging && !boundedSampling && !finiteBuildValidation, observerLogging && !boundedSampling && !finiteBuildValidation ? 'high' : undefined);
}

function analyzeVerboseOutput() {
  const explicitVerbose = /(^|\s)--verbose\b|--debug\b|\s-v\b/i.test(source);
  const diagnostic = /diagnostic|troubleshooting|workflow_dispatch/i.test(source);
  result(explicitVerbose && !diagnostic, explicitVerbose && !diagnostic ? 'medium' : undefined);
}

function analyzeSecretSafeOutput() {
  const credentialFlow = /--user\s+["']?\$?\{?ftp_(username|password|host|port)/i.test(source)
    || /\$ftp_username.*\$ftp_password/i.test(source);
  const directOutputSink = /(^|[|;&]\s*|\n\s*)(echo|printf|console\.(log|warn|error|debug)|tee)\b[^\n]*(ftp_(username|password)|FTP_(USERNAME|PASSWORD))/i.test(source);
  const directSecretExpansion = /(?:\$\{(?:FTP_(?:USERNAME|PASSWORD|HOST|PORT)|[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN))\}|\$(?:FTP_(?:USERNAME|PASSWORD|HOST|PORT)|[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN))|process\.env\.(?:FTP_(?:USERNAME|PASSWORD|HOST|PORT)|[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN)))/i.test(source);
  const verboseCredentialCommand = /(?:curl|lftp)[\s\\\n]*[\s\S]{0,500}?(?:--verbose|--debug)[\s\\\n]*[\s\S]{0,500}?(?:ftp_(?:username|password)|FTP_(?:USERNAME|PASSWORD))/i.test(source);
  const directSecretOutput = directSecretExpansion && directOutputSink;
  const finding = directSecretOutput || (credentialFlow && verboseCredentialCommand);
  result(finding, finding ? 'high' : undefined);
}

function analyzeGithubActionsSummary() {
  const workflow = /(^|\n)\s*jobs:/i.test(source);
  const hasSummary = /github_step_summary/i.test(source);
  result(workflow && !hasSummary, workflow && !hasSummary ? 'medium' : undefined);
}

function analyzeCiContextRichOutput() {
  const workflow = /(^|\n)\s*jobs:/i.test(source);
  const operationalCommand = /npm\s+(ci|test|run\s+build)|lftp\s+|curl\s+/i.test(source);
  const hasSummary = /github_step_summary/i.test(source);
  result(workflow && operationalCommand && !hasSummary, workflow && operationalCommand && !hasSummary ? 'medium' : undefined);
}

switch (rule) {
  case 'runtime-aware-logging':
    analyzeRuntimeAware();
    break;
  case 'log-amplification':
    analyzeLogAmplification();
    break;
  case 'verbose-output':
    analyzeVerboseOutput();
    break;
  case 'secret-safe-output':
    analyzeSecretSafeOutput();
    break;
  case 'github-actions-summary':
    analyzeGithubActionsSummary();
    break;
  case 'ci-context-rich-output':
    analyzeCiContextRichOutput();
    break;
  default:
    console.error(`Unsupported rule: ${rule}`);
    process.exit(2);
}
