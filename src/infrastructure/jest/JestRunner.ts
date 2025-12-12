import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import Logger from '../logging/Logger';

/**
 * JestRunner - Execute Jest tests programmatically
 * Phase 13: Jest MCP Server - Infrastructure for running generated test suites
 */

export interface JestRunOptions {
  testFilePath?: string;
  testSuiteName?: string;
  timeout?: number;
  verbose?: boolean;
  bail?: boolean;
  coverage?: boolean;
  watchMode?: boolean;
}

export interface JestRunResult {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  testResults: JestTestResult[];
  startTime: number;
  endTime: number;
  durationMs: number;
  errorMessage?: string;
  rawOutput?: string;
}

export interface JestTestResult {
  testFilePath: string;
  testName: string;
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  duration: number;
  failureMessage?: string;
  failureDetails?: string;
}

export class JestRunner {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Run Jest tests with specified options
   * @param options Jest run configuration
   * @returns Promise resolving to test results
   */
  async runTests(options: JestRunOptions = {}): Promise<JestRunResult> {
    const startTime = Date.now();
    Logger.info('jest:run:start', { options });

    try {
      // Create temp directory for Jest output
      const tempDir = path.join(this.workspaceRoot, '.jest-output');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const outputFile = path.join(tempDir, `jest-results-${Date.now()}.json`);

      // Build Jest CLI arguments
      const args = this.buildJestArgs(options, outputFile);

      // Execute Jest
      const { stdout, stderr, exitCode } = await this.executeJest(args, options);

      // Parse results
      const results = await this.parseJestOutput(outputFile, stdout, stderr, exitCode);

      const endTime = Date.now();
      results.startTime = startTime;
      results.endTime = endTime;
      results.durationMs = endTime - startTime;

      Logger.info('jest:run:complete', {
        success: results.success,
        total: results.numTotalTests,
        passed: results.numPassedTests,
        failed: results.numFailedTests,
      });

      return results;
    } catch (error: any) {
      const endTime = Date.now();
      Logger.error('jest:run:error', { error: error.message });

      return {
        success: false,
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [],
        startTime,
        endTime,
        durationMs: endTime - startTime,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Build Jest CLI arguments from options
   */
  private buildJestArgs(options: JestRunOptions, outputFile: string): string[] {
    const args: string[] = [];

    // JSON output for parsing
    args.push('--json');
    args.push(`--outputFile=${outputFile}`);

    // Specific test file or pattern
    if (options.testFilePath) {
      args.push(options.testFilePath);
    }

    if (options.testSuiteName) {
      args.push(`--testNamePattern=${options.testSuiteName}`);
    }

    // Additional options
    if (options.verbose) {
      args.push('--verbose');
    }

    if (options.bail) {
      args.push('--bail');
    }

    if (options.coverage) {
      args.push('--coverage');
    }

    if (options.watchMode) {
      args.push('--watch');
    }

    // Always run in band for controlled execution
    args.push('--runInBand');

    // No cache for fresh results
    args.push('--no-cache');

    return args;
  }

  /**
   * Execute Jest using npx or local installation
   */
  private executeJest(
    args: string[],
    options: JestRunOptions
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout ?? 60000; // 60s default
      let stdout = '';
      let stderr = '';

      // Use npx to run jest
      const jestProcess = spawn('npx', ['jest', ...args], {
        cwd: this.workspaceRoot,
        shell: true,
      });

      jestProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      jestProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutHandle = setTimeout(() => {
        jestProcess.kill();
        reject(new Error(`Jest execution timed out after ${timeout}ms`));
      }, timeout);

      jestProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        resolve({ stdout, stderr, exitCode: code ?? 0 });
      });

      jestProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
    });
  }

  /**
   * Parse Jest JSON output file
   */
  private async parseJestOutput(
    outputFile: string,
    stdout: string,
    stderr: string,
    exitCode: number
  ): Promise<JestRunResult> {
    try {
      // Read JSON output file
      if (!fs.existsSync(outputFile)) {
        throw new Error('Jest output file not found');
      }

      const rawJson = fs.readFileSync(outputFile, 'utf-8');
      const jestOutput = JSON.parse(rawJson);

      const testResults: JestTestResult[] = [];

      // Parse test results from Jest JSON output
      if (jestOutput.testResults && Array.isArray(jestOutput.testResults)) {
        for (const fileResult of jestOutput.testResults) {
          if (fileResult.assertionResults && Array.isArray(fileResult.assertionResults)) {
            for (const assertion of fileResult.assertionResults) {
              testResults.push({
                testFilePath: fileResult.name || fileResult.testFilePath || 'unknown',
                testName: assertion.fullName || assertion.title || 'unknown',
                status: assertion.status === 'passed' ? 'passed' : assertion.status === 'failed' ? 'failed' : 'pending',
                duration: assertion.duration || 0,
                failureMessage: assertion.failureMessages?.[0],
                failureDetails: assertion.failureMessages?.join('\n'),
              });
            }
          }
        }
      }

      return {
        success: jestOutput.success ?? exitCode === 0,
        numTotalTests: jestOutput.numTotalTests ?? testResults.length,
        numPassedTests: jestOutput.numPassedTests ?? testResults.filter((t) => t.status === 'passed').length,
        numFailedTests: jestOutput.numFailedTests ?? testResults.filter((t) => t.status === 'failed').length,
        numPendingTests: jestOutput.numPendingTests ?? testResults.filter((t) => t.status === 'pending').length,
        testResults,
        startTime: jestOutput.startTime ?? 0,
        endTime: Date.now(),
        durationMs: 0,
        rawOutput: stdout,
      };
    } catch (error: any) {
      Logger.error('jest:parse:error', { error: error.message });
      return {
        success: false,
        numTotalTests: 0,
        numPassedTests: 0,
        numFailedTests: 0,
        numPendingTests: 0,
        testResults: [],
        startTime: 0,
        endTime: Date.now(),
        durationMs: 0,
        errorMessage: error.message,
        rawOutput: stdout,
      };
    }
  }
}

export default JestRunner;
