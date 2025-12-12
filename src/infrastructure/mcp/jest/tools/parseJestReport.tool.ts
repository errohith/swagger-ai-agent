import JestReportParser from '../../../jest/JestReportParser';
import { JestRunResult } from '../../../jest/JestRunner';
import { RunReport } from '../../../../domain/models/RunReport';
import Logger from '../../../logging/Logger';

/**
 * MCP Tool: Parse Jest JSON output into RunReport
 * Phase 13: Jest MCP Server - Convert Jest results to domain model
 */

export interface ParseJestReportInput {
  jestResultJson: string; // Raw Jest JSON output as string
  runId: string;
  aggregateByPath?: boolean;
}

export interface ParseJestReportOutput {
  report: RunReport;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    durationMs: number;
    success: boolean;
  };
}

export async function parseJestReportTool(
  input: ParseJestReportInput
): Promise<ParseJestReportOutput> {
  Logger.info('mcp:jest:parseReport:start', { runId: input.runId });

  try {
    // Parse JSON string to JestRunResult
    const jestResult: JestRunResult = JSON.parse(input.jestResultJson);

    // Initialize parser
    const parser = new JestReportParser();

    // Convert to RunReport
    const report = parser.parseToRunReport(jestResult, input.runId, {
      aggregateByPath: input.aggregateByPath ?? true,
    });

    // Extract summary
    const summary = parser.extractSummary(jestResult);

    Logger.info('mcp:jest:parseReport:complete', {
      runId: input.runId,
      totalTests: summary.totalTests,
    });

    return { report, summary };
  } catch (error: any) {
    Logger.error('mcp:jest:parseReport:error', {
      runId: input.runId,
      error: error.message,
    });
    throw new Error(`Failed to parse Jest report: ${error.message}`);
  }
}
