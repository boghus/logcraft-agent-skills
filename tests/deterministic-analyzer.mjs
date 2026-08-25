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

function extractForBlocks(input) {
  const blocks = [];
  const loopStart = /for\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = loopStart.exec(input)) !== null) {
    let depth = 1;
    let index = match.index + match[0].length;
    let quote = null;
    let escaped = false;
    for (; index < input.length && depth > 0; index += 1) {
      const character = input[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'" || character === '`') quote = character;
      else if (character === '{') depth += 1;
      else if (character === '}') depth -= 1;
    }
    if (depth === 0) blocks.push(input.slice(match.index, index));
  }
  return blocks;
}

function hasEntityIdentifier(argumentsSource) {
  return /(?:\b(?:id|uuid|key|name)\b\s*[:=]\s*[^,)}]+|\b(?:employee|user|record|item)\.(?:id|uuid|key|name)\b)/i.test(argumentsSource);
}

function extractCalls(input, headerPattern) {
  const calls = [];
  const header = new RegExp(headerPattern.source, headerPattern.flags.includes('g') ? headerPattern.flags : headerPattern.flags + 'g');
  let match;
  while ((match = header.exec(input)) !== null) {
    let index = match.index + match[0].length;
    if (input[index] !== '(') continue;
    const start = index;
    let depth = 1;
    let quote = null;
    let escaped = false;
    index += 1;
    for (; index < input.length && depth > 0; index += 1) {
      const character = input[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'" || character === '`') quote = character;
      else if (character === '(') depth += 1;
      else if (character === ')') depth -= 1;
    }
    if (depth === 0) calls.push(input.slice(start + 1, index - 1));
  }
  return calls;
}

function loggerCalls() {
  return extractCalls(source, /logger\.(info|warn|error|debug)/gi);
}

function analyzeLogFrequency() {
  const blocks = extractForBlocks(source);
  const repeatedInfo = blocks.some((block) => /console\.info\(\s*['"][^'"]+['"]\s*\)/i.test(block));
  const repeatedDebugWithContext = blocks.some((block) => extractCalls(block, /console\.debug/gi).some((call) => hasEntityIdentifier(call)));
  result(repeatedInfo && !repeatedDebugWithContext, repeatedInfo && !repeatedDebugWithContext ? 'medium' : undefined);
}

function analyzeDurationAndPerformance() {
  const durationPattern = /duration\s*[:=]\s*(\$\{[^}]+\}|[^,}\n]+)/gi;
  const occurrences = [...source.matchAll(durationPattern)];
  const hasUnqualifiedDuration = occurrences.some((match) => !/(?:ms|millis(?:econd)?s?|s|sec(?:ond)?s?)\s*$/i.test(match[1].trim()));
  result(hasUnqualifiedDuration, hasUnqualifiedDuration ? 'medium' : undefined);
}

function hasMeaningfulLog() {
  return loggerCalls().some((log) => /(?:processed|completed|failed|recovered|synchroniz|deployed|migration|authorization|outcome)/i.test(log));
}

function hasMeaningfulOperation() {
  return /\b(?:paymentService\.process|externalService\.sync|(?:deploy|migrat|authoriz|synchroniz)[A-Za-z]*)\s*\(/i.test(source);
}

function hasRoutineLog() {
  return loggerCalls().some((log) => /(?:entering|object received|processing)\s+\w+/i.test(log));
}

function analyzeWhenToLog() {
  const meaningfulOperationWithoutLog = hasMeaningfulOperation() && !hasMeaningfulLog();
  result(meaningfulOperationWithoutLog, meaningfulOperationWithoutLog ? 'medium' : undefined);
}

function analyzeWhenNotToLog() {
  const routineLog = hasRoutineLog();
  result(routineLog, routineLog ? 'medium' : undefined);
}

function analyzeContext() {
  const calls = loggerCalls();
  const hasInsufficientContext = calls.some((log) => {
    const hasOutcome = /\b(outcome|result|reason|status)\b/i.test(log);
    const hasRelevantIdentifier = /\b(?:userId|user_id|orderId|order_id|paymentId|payment_id)\b/i.test(log);
    const hasOperation = /\b(?:operationId|operation_id|correlationId|correlation_id|requestId|request_id)\b/i.test(log);
    return !(hasOutcome && (hasRelevantIdentifier || hasOperation));
  });
  result(hasInsufficientContext, hasInsufficientContext ? 'medium' : undefined);
}

function analyzeIdentifiersAndUuids() {
  const hasLog = /logger\.(info|warn|error|debug)\s*\(/i.test(source);
  const hasAtomicIdentifier = /\b(?:licenseId|orderId|paymentId|entityId)\b/i.test(source);
  const hasBroaderIdentifier = /\b(?:workerId|tenantId|parentId)\b/i.test(source);
  const generatesUuid = /(?:crypto\.randomUUID|UUID\.randomUUID|uuid\s*\()/i.test(source);
  const hasExistingIdentifier = /\b(?:licenseId|orderId|paymentId|entityId|requestId|correlationId|traceId)\b/i.test(source);
  const finding = hasLog && ((hasBroaderIdentifier && hasAtomicIdentifier) || (generatesUuid && hasExistingIdentifier));
  result(finding, finding ? 'medium' : undefined);
}

function analyzeTraceability() {
  const hasCorrelation = /\b(?:correlationId|correlation_id|requestId|request_id|traceId|trace_id|operationId|operation_id)\b/i.test(source);
  const propagatesCorrelation = /(?:send|publish|dispatch|emit|enqueue)\s*\([^)]*\b(?:correlationId|correlation_id|requestId|request_id|traceId|trace_id|operationId|operation_id)\b/i.test(source);
  const downstreamDropsCorrelation = /(?:send|publish|dispatch|emit|enqueue)\s*\(\s*\{\s*\}\s*\)/i.test(source);
  const completedWithoutCorrelation = /logger\.(info|warn|error|debug)\s*\([^)]*completed[^)]*\)/i.test(source) && !/completed[\s\S]{0,250}\b(?:correlationId|correlation_id|requestId|request_id|traceId|trace_id|operationId|operation_id)\b/i.test(source);
  const finding = hasCorrelation && ((!propagatesCorrelation && downstreamDropsCorrelation) || completedWithoutCorrelation);
  result(finding, finding ? 'medium' : undefined);
}

const transversalPrinciples = ['existing-capability', 'unnecessary-mechanism', 'unsupported-capability', 'appropriate-observability'];

function analyzeTransversalPrinciples() {
  for (const principle of transversalPrinciples) {
    const marker = new RegExp(`LOGCRAFT_TRANSVERSAL:\\s*${principle}\\b`, 'i');
    const safeMarker = new RegExp(`LOGCRAFT_TRANSVERSAL:\\s*${principle}-safe\\b`, 'i');
    if (safeMarker.test(source)) { result(false); return; }
    if (marker.test(source)) { result(true, 'medium'); return; }
  }
  result(false);
}

switch (rule) {
  case 'runtime-aware-logging': analyzeRuntimeAware(); break;
  case 'log-amplification': analyzeLogAmplification(); break;
  case 'verbose-output': analyzeVerboseOutput(); break;
  case 'secret-safe-output': analyzeSecretSafeOutput(); break;
  case 'github-actions-summary': analyzeGithubActionsSummary(); break;
  case 'ci-context-rich-output': analyzeCiContextRichOutput(); break;
  case 'log-frequency': analyzeLogFrequency(); break;
  case 'duration-and-performance': analyzeDurationAndPerformance(); break;
  case 'when-to-log': analyzeWhenToLog(); break;
  case 'when-not-to-log': analyzeWhenNotToLog(); break;
  case 'context': analyzeContext(); break;
  case 'identifiers-and-uuids': analyzeIdentifiersAndUuids(); break;
  case 'traceability': analyzeTraceability(); break;
  case 'transversal-principles': analyzeTransversalPrinciples(); break;
  default:
    console.error(`Unsupported rule: ${rule}`);
    process.exit(2);
}
