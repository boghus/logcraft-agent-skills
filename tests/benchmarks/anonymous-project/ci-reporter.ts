import type { Reporter, TestCase, TestResult } from 'test-runner/reporter';

export class CiReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    const marker = result.status === 'passed' ? '✓' : '✗';
    console.log(`${marker} ${test.title}`);

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.error(error.stack ?? error.message ?? String(error));
      }
    }
  }
}
