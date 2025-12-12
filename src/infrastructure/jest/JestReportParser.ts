import { RunReport, PerTestResult, TestResultStatus } from '../../domain/models/RunReport';
import { JestRunResult, JestTestResult } from './JestRunner';
import Logger from '../logging/Logger';

/**
 * JestReportParser - Parse Jest JSON output into RunReport domain model
 * Phase 13: Jest MCP Server - Bridge between Jest results and domain layer
 */

export interface ParseOptions {
  includeRawOutput?: boolean;
  aggregateByPath?: boolean;
  aggregateByStatus?: boolean;
}

export class JestReportParser {
  /**
   * Parse Jest run result into RunReport domain model
   * @param jestResult Raw Jest execution result
   * @param runId Unique identifier for this test run
   * @param options Parsing options
   * @returns RunReport compatible with existing domain model
   */
  parseToRunReport(
    jestResult: JestRunResult,
    runId: string,
    options: ParseOptions = {}
  ): RunReport {
    Logger.info('jest:parse:start', { runId, totalTests: jestResult.numTotalTests });

    const perTestResults: PerTestResult[] = jestResult.testResults.map((test) =>
      this.convertJestTestToPerTestResult(test)
    );

    const report: RunReport = {
      runId,
      total: jestResult.numTotalTests,
      passed: jestResult.numPassedTests,
      failed: jestResult.numFailedTests,
      errored: 0, // Jest doesn't distinguish errors from failures
      tests: perTestResults,
    };

    // Add aggregates if requested
    if (options.aggregateByPath) {
      report.aggregates = this.computeAggregates(perTestResults);
    }

    Logger.info('jest:parse:complete', {
      runId,
      passed: report.passed,
      failed: report.failed,
    });

    return report;
  }

  /**
   * Convert Jest test result to PerTestResult domain model
   */
  private convertJestTestToPerTestResult(jestTest: JestTestResult): PerTestResult {
    const success = jestTest.status === 'passed';
    const status: TestResultStatus = 
      jestTest.status === 'passed' ? 'passed' : 
      jestTest.status === 'failed' ? 'failed' : 
      jestTest.status === 'pending' ? 'skipped' : 'skipped';

    return {
      testId: jestTest.testName,
      operationId: jestTest.testName,
      status,
      expectedStatus: this.extractStatusCodeFromTestName(jestTest.testName),
      actualStatus: success ? this.extractStatusCodeFromTestName(jestTest.testName) : undefined,
      durationMs: jestTest.duration,
      request: {
        url: '', // Not available from Jest results
        method: this.extractMethodFromTestName(jestTest.testName),
        headers: {},
        body: undefined,
      },
      response: success
        ? {
            status: this.extractStatusCodeFromTestName(jestTest.testName),
            headers: {},
            body: null,
          }
        : undefined,
      error: success ? undefined : jestTest.failureMessage || jestTest.failureDetails || 'Test failed',
    };
  }

  /**
   * Extract HTTP method from test name (heuristic)
   * Example: "GET /api/users should return 200" -> "GET"
   */
  private extractMethodFromTestName(testName: string): string {
    const methodMatch = testName.match(/\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/i);
    return methodMatch ? methodMatch[1].toUpperCase() : 'UNKNOWN';
  }

  /**
   * Extract expected status code from test name (heuristic)
   * Example: "GET /api/users should return 200" -> 200
   */
  private extractStatusCodeFromTestName(testName: string): number {
    const statusMatch = testName.match(/\b(200|201|204|400|401|403|404|500)\b/);
    return statusMatch ? parseInt(statusMatch[1], 10) : 0;
  }

  /**
   * Compute aggregates by operationId (test name)
   */
  private computeAggregates(tests: PerTestResult[]): RunReport['aggregates'] {
    const byOperationId: Record<string, { total: number; passed: number; failed: number; errored: number }> = {};

    for (const test of tests) {
      const key = test.operationId;
      if (!byOperationId[key]) {
        byOperationId[key] = { total: 0, passed: 0, failed: 0, errored: 0 };
      }

      byOperationId[key].total += 1;
      if (test.status === 'passed') {
        byOperationId[key].passed += 1;
      } else if (test.status === 'failed') {
        byOperationId[key].failed += 1;
      } else if (test.status === 'error') {
        byOperationId[key].errored += 1;
      }
    }

    return { byPath: byOperationId };
  }

  /**
   * Extract summary statistics from Jest result
   */
  extractSummary(jestResult: JestRunResult): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    pendingTests: number;
    durationMs: number;
    success: boolean;
  } {
    return {
      totalTests: jestResult.numTotalTests,
      passedTests: jestResult.numPassedTests,
      failedTests: jestResult.numFailedTests,
      pendingTests: jestResult.numPendingTests,
      durationMs: jestResult.durationMs,
      success: jestResult.success,
    };
  }

  /**
   * Format error messages from failed tests
   */
  formatFailureMessages(jestResult: JestRunResult): string[] {
    return jestResult.testResults
      .filter((test) => test.status === 'failed' && test.failureMessage)
      .map((test) => `${test.testName}: ${test.failureMessage}`);
  }
}

export default JestReportParser;
