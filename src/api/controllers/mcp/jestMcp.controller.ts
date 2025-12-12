import { Request, Response, NextFunction } from 'express';
import { runJestTestsTool, RunJestTestsInput } from '../../../infrastructure/mcp/jest/tools/runJestTests.tool';
import { parseJestReportTool, ParseJestReportInput } from '../../../infrastructure/mcp/jest/tools/parseJestReport.tool';
import Logger from '../../../infrastructure/logging/Logger';
import path from 'path';

/**
 * MCP Jest Controller - HTTP handlers for Jest execution tools
 * Phase 13: Jest MCP Server
 */

/**
 * POST /mcp/jest/run-tests
 * Execute Jest tests from generated test files
 */
export async function runJestTestsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: RunJestTestsInput = req.body;

    Logger.info('mcp:jest:controller:runTests:start', { input });

    // Validate input
    if (!input.testFilePath || typeof input.testFilePath !== 'string') {
      res.status(400).json({
        error: 'testFilePath is required and must be a string',
      });
      return;
    }

    // Resolve workspace root (assume project root is two levels up from this file)
    const workspaceRoot = path.resolve(__dirname, '../../../..');

    // Execute Jest tests
    const result = await runJestTestsTool(input, workspaceRoot);

    Logger.info('mcp:jest:controller:runTests:complete', {
      runId: result.runId,
      success: result.success,
    });

    res.status(200).json(result);
  } catch (error: any) {
    Logger.error('mcp:jest:controller:runTests:error', { error: error.message });
    next(error);
  }
}

/**
 * POST /mcp/jest/parse-report
 * Parse Jest JSON output into RunReport domain model
 */
export async function parseJestReportHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input: ParseJestReportInput = req.body;

    Logger.info('mcp:jest:controller:parseReport:start', { runId: input.runId });

    // Validate input
    if (!input.jestResultJson || typeof input.jestResultJson !== 'string') {
      res.status(400).json({
        error: 'jestResultJson is required and must be a string',
      });
      return;
    }

    if (!input.runId || typeof input.runId !== 'string') {
      res.status(400).json({
        error: 'runId is required and must be a string',
      });
      return;
    }

    // Parse Jest report
    const result = await parseJestReportTool(input);

    Logger.info('mcp:jest:controller:parseReport:complete', {
      runId: input.runId,
      totalTests: result.summary.totalTests,
    });

    res.status(200).json(result);
  } catch (error: any) {
    Logger.error('mcp:jest:controller:parseReport:error', { error: error.message });
    next(error);
  }
}

/**
 * GET /mcp/jest/health
 * Health check endpoint for Jest MCP server
 */
export async function jestHealthHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(200).json({
      status: 'healthy',
      service: 'jest-mcp-server',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    next(error);
  }
}
