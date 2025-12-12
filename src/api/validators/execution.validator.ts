/**
 * Execution request validators
 * Phase 12: Hardening - Add strict validation for execution endpoints
 */

export interface RunRequestBody {
  runId: string;
}

export interface RetryFailedBody {
  runId: string;
}

/**
 * Validates POST /execution/run request body
 */
export function validateRunRequest(body: any): RunRequestBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }
  if (!body.runId || typeof body.runId !== 'string' || body.runId.trim().length === 0) {
    throw new Error('runId is required and must be a non-empty string');
  }
  return { runId: body.runId.trim() };
}

/**
 * Validates POST /execution/retry-failed request body
 */
export function validateRetryFailedRequest(body: any): RetryFailedBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }
  if (!body.runId || typeof body.runId !== 'string' || body.runId.trim().length === 0) {
    throw new Error('runId is required and must be a non-empty string');
  }
  return { runId: body.runId.trim() };
}
