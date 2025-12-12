/**
 * Test generation request validators
 * Phase 12: Hardening - Add strict validation for testgen endpoints
 */

export interface GenerateTestsBody {
  specId: string;
  selection?: {
    mode?: 'tag' | 'full' | 'operation';
    tags?: string[];
    operationIds?: string[];
  };
  options?: {
    includeNegativeTests?: boolean;
    includeAuthTests?: boolean;
    includeBoundaryTests?: boolean;
  };
}

/**
 * Validates POST /testgen/generate-axios-tests request body
 */
export function validateGenerateTestsBody(body: any): GenerateTestsBody {
  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object');
  }
  if (!body.specId || typeof body.specId !== 'string' || body.specId.trim().length === 0) {
    throw new Error('specId is required and must be a non-empty string');
  }

  const result: GenerateTestsBody = { specId: body.specId.trim() };

  if (body.selection) {
    if (typeof body.selection !== 'object') {
      throw new Error('selection must be an object');
    }
    result.selection = {};
    if (body.selection.mode && !['tag', 'full', 'operation'].includes(body.selection.mode)) {
      throw new Error('selection.mode must be one of: tag, full, operation');
    }
    if (body.selection.mode) result.selection.mode = body.selection.mode;
    if (body.selection.tags) {
      if (!Array.isArray(body.selection.tags)) {
        throw new Error('selection.tags must be an array');
      }
      result.selection.tags = body.selection.tags;
    }
    if (body.selection.operationIds) {
      if (!Array.isArray(body.selection.operationIds)) {
        throw new Error('selection.operationIds must be an array');
      }
      result.selection.operationIds = body.selection.operationIds;
    }
  }

  if (body.options) {
    if (typeof body.options !== 'object') {
      throw new Error('options must be an object');
    }
    result.options = {
      includeNegativeTests: !!body.options.includeNegativeTests,
      includeAuthTests: !!body.options.includeAuthTests,
      includeBoundaryTests: !!body.options.includeBoundaryTests,
    };
  }

  return result;
}
