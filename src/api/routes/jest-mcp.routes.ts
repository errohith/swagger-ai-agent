import { Router } from 'express';
import {
  runJestTestsHandler,
  parseJestReportHandler,
  jestHealthHandler,
} from '../controllers/mcp/jestMcp.controller';

/**
 * Jest MCP Routes - HTTP routes for Jest execution tools
 * Phase 13: Jest MCP Server
 */

const router = Router();

/**
 * POST /mcp/jest/run-tests
 * Execute Jest tests from generated test files
 *
 * Request Body:
 * {
 *   "testFilePath": "tests/generated/api-tests.spec.ts",
 *   "testSuiteName": "GET /api/users",
 *   "timeout": 60000,
 *   "verbose": false,
 *   "bail": false
 * }
 *
 * Response:
 * {
 *   "runId": "uuid",
 *   "success": true,
 *   "totalTests": 10,
 *   "passedTests": 8,
 *   "failedTests": 2,
 *   "durationMs": 5432,
 *   "failureMessages": ["..."]
 * }
 */
router.post('/run-tests', runJestTestsHandler);

/**
 * POST /mcp/jest/parse-report
 * Parse Jest JSON output into RunReport domain model
 *
 * Request Body:
 * {
 *   "jestResultJson": "{ ... }",
 *   "runId": "uuid",
 *   "aggregateByPath": true
 * }
 *
 * Response:
 * {
 *   "report": { ... },
 *   "summary": { ... }
 * }
 */
router.post('/parse-report', parseJestReportHandler);

/**
 * GET /mcp/jest/health
 * Health check endpoint
 *
 * Response:
 * {
 *   "status": "healthy",
 *   "service": "jest-mcp-server",
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 */
router.get('/health', jestHealthHandler);

export default router;
