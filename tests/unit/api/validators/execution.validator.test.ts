import {
  validateRunRequest,
  validateRetryFailedRequest,
} from '../../../../src/api/validators/execution.validator';

describe('execution.validator', () => {
  describe('validateRunRequest', () => {
    it('should accept valid run request', () => {
      const body = { runId: 'run-123' };
      expect(() => validateRunRequest(body)).not.toThrow();
    });

    it('should throw error when runId is missing', () => {
      const body = {};
      expect(() => validateRunRequest(body)).toThrow('runId is required');
    });

    it('should throw error when runId is not a string', () => {
      const body = { runId: 123 };
      expect(() => validateRunRequest(body)).toThrow('runId is required and must be a non-empty string');
    });

    it('should throw error when runId is empty string', () => {
      const body = { runId: '   ' };
      expect(() => validateRunRequest(body)).toThrow('runId is required');
    });

    it('should trim whitespace from runId', () => {
      const body = { runId: '  run-456  ' };
      expect(() => validateRunRequest(body)).not.toThrow();
    });
  });

  describe('validateRetryFailedRequest', () => {
    it('should accept valid retry request', () => {
      const body = { runId: 'run-original' };
      expect(() => validateRetryFailedRequest(body)).not.toThrow();
    });

    it('should throw error when runId is missing', () => {
      const body = {};
      expect(() => validateRetryFailedRequest(body)).toThrow('runId is required');
    });

    it('should throw error when runId is not a string', () => {
      const body = { runId: null };
      expect(() => validateRetryFailedRequest(body)).toThrow('runId is required and must be a non-empty string');
    });

    it('should throw error when runId is empty after trimming', () => {
      const body = { runId: '  ' };
      expect(() => validateRetryFailedRequest(body)).toThrow('runId is required');
    });
  });
});
