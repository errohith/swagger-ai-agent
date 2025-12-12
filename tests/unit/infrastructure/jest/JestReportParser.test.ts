import JestReportParser from '../../../../src/infrastructure/jest/JestReportParser';
import type { JestRunResult } from '../../../../src/infrastructure/jest/JestRunner';

describe('JestReportParser', () => {
  let parser: JestReportParser;

  beforeEach(() => {
    parser = new JestReportParser();
  });

  describe('parseToRunReport', () => {
    it('should parse successful jest results to RunReport', () => {
      const jestResult: JestRunResult = {
        success: true,
        numTotalTests: 2,
        numPassedTests: 2,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'GET /users should return 200',
            status: 'passed',
            duration: 100,
          },
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'POST /users should return 201',
            status: 'passed',
            duration: 150,
          },
        ],
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        durationMs: 1000,
      };

      const report = parser.parseToRunReport(jestResult, 'run-123');

      expect(report.runId).toBe('run-123');
      expect(report.total).toBe(2);
      expect(report.passed).toBe(2);
      expect(report.failed).toBe(0);
      expect(report.tests).toHaveLength(2);
      expect(report.tests[0].status).toBe('passed');
    });

    it('should parse failed jest results correctly', () => {
      const jestResult: JestRunResult = {
        success: false,
        numTotalTests: 2,
        numPassedTests: 1,
        numFailedTests: 1,
        numPendingTests: 0,
        testResults: [
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'GET /users should return 200',
            status: 'passed',
            duration: 100,
          },
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'POST /users should return 201',
            status: 'failed',
            duration: 150,
            failureMessage: 'Expected 201 but got 500',
            failureDetails: 'Server error occurred',
          },
        ],
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        durationMs: 1000,
      };

      const report = parser.parseToRunReport(jestResult, 'run-456');

      expect(report.total).toBe(2);
      expect(report.passed).toBe(1);
      expect(report.failed).toBe(1);
      expect(report.tests[1].status).toBe('failed');
      expect(report.tests[1].error).toContain('Expected 201 but got 500');
    });

    it('should compute aggregates when requested', () => {
      const jestResult: JestRunResult = {
        success: true,
        numTotalTests: 3,
        numPassedTests: 2,
        numFailedTests: 1,
        numPendingTests: 0,
        testResults: [
          {
            testFilePath: 'tests/users.test.ts',
            testName: 'GET /users should return 200',
            status: 'passed',
            duration: 100,
          },
          {
            testFilePath: 'tests/users.test.ts',
            testName: 'POST /users should return 201',
            status: 'failed',
            duration: 150,
          },
          {
            testFilePath: 'tests/orders.test.ts',
            testName: 'GET /orders should return 200',
            status: 'passed',
            duration: 120,
          },
        ],
        startTime: Date.now(),
        endTime: Date.now(),
        durationMs: 500,
      };

      const report = parser.parseToRunReport(jestResult, 'run-789', {
        aggregateByPath: true,
      });

      expect(report.aggregates).toBeDefined();
      expect(report.aggregates?.byPath).toBeDefined();
    });
  });

  describe('extractSummary', () => {
    it('should extract summary statistics from jest result', () => {
      const jestResult: JestRunResult = {
        success: true,
        numTotalTests: 5,
        numPassedTests: 4,
        numFailedTests: 1,
        numPendingTests: 0,
        testResults: [],
        startTime: Date.now() - 2000,
        endTime: Date.now(),
        durationMs: 2000,
      };

      const summary = parser.extractSummary(jestResult);

      expect(summary.totalTests).toBe(5);
      expect(summary.passedTests).toBe(4);
      expect(summary.failedTests).toBe(1);
      expect(summary.durationMs).toBe(2000);
      expect(summary.success).toBe(true);
    });
  });

  describe('formatFailureMessages', () => {
    it('should format failure messages from failed tests', () => {
      const jestResult: JestRunResult = {
        success: false,
        numTotalTests: 2,
        numPassedTests: 1,
        numFailedTests: 1,
        numPendingTests: 0,
        testResults: [
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'GET /users',
            status: 'passed',
            duration: 100,
          },
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'POST /users',
            status: 'failed',
            duration: 150,
            failureMessage: 'Assertion failed',
          },
        ],
        startTime: Date.now(),
        endTime: Date.now(),
        durationMs: 500,
      };

      const messages = parser.formatFailureMessages(jestResult);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain('POST /users');
      expect(messages[0]).toContain('Assertion failed');
    });

    it('should return empty array when no failures', () => {
      const jestResult: JestRunResult = {
        success: true,
        numTotalTests: 2,
        numPassedTests: 2,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [
          {
            testFilePath: 'tests/api.test.ts',
            testName: 'GET /users',
            status: 'passed',
            duration: 100,
          },
        ],
        startTime: Date.now(),
        endTime: Date.now(),
        durationMs: 500,
      };

      const messages = parser.formatFailureMessages(jestResult);

      expect(messages).toHaveLength(0);
    });
  });
});
