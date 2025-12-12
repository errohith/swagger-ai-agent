import { v4 as uuidv4 } from 'uuid';
import JestRunner, { JestRunOptions } from '../../../jest/JestRunner';
import JestReportParser from '../../../jest/JestReportParser';
import Logger from '../../../logging/Logger';

/**
 * MCP Tool: Run Jest tests programmatically
 * Phase 13: Jest MCP Server - Execute generated test files
 */

export interface RunJestTestsInput {
  testFilePath: string;
  testSuiteName?: string;
  timeout?: number;
  verbose?: boolean;
  bail?: boolean;
}

export interface RunJestTestsOutput {
  runId: string;
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  durationMs: number;
  failureMessages?: string[];
  rawOutput?: string;
}

export async function runJestTestsTool(
  input: RunJestTestsInput,
  workspaceRoot: string
): Promise<RunJestTestsOutput> {
  Logger.info('mcp:jest:runTests:start', { input });

  const runId = uuidv4();

  try {
    // Initialize JestRunner
    const jestRunner = new JestRunner(workspaceRoot);

    // Configure Jest run options
    const options: JestRunOptions = {
      testFilePath: input.testFilePath,
      testSuiteName: input.testSuiteName,
      timeout: input.timeout ?? 60000,
      verbose: input.verbose ?? false,
      bail: input.bail ?? false,
    };

    // Execute Jest tests
    const jestResult = await jestRunner.runTests(options);

    // Parse results
    const parser = new JestReportParser();
    const failureMessages = parser.formatFailureMessages(jestResult);

    Logger.info('mcp:jest:runTests:complete', {
      runId,
      success: jestResult.success,
      total: jestResult.numTotalTests,
    });

    return {
      runId,
      success: jestResult.success,
      totalTests: jestResult.numTotalTests,
      passedTests: jestResult.numPassedTests,
      failedTests: jestResult.numFailedTests,
      durationMs: jestResult.durationMs,
      failureMessages: failureMessages.length > 0 ? failureMessages : undefined,
      rawOutput: input.verbose ? jestResult.rawOutput : undefined,
    };
  } catch (error: any) {
    Logger.error('mcp:jest:runTests:error', { error: error.message });
    throw new ExecutionError(
      'Failed to execute Jest tests',
      { testFilePath: input.testFilePath, testSuiteName: input.testSuiteName, originalError: error.message }
    );
  }
}
