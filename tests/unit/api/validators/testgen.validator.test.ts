import { validateGenerateTestsBody } from '../../../../src/api/validators/testgen.validator';

describe('testgen.validator', () => {
  describe('validateGenerateTestsBody', () => {
    it('should accept valid full mode request', () => {
      const body = {
        specId: 'spec-123',
        selection: { mode: 'full' },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should accept valid tag mode request', () => {
      const body = {
        specId: 'spec-456',
        selection: { mode: 'tag', tags: ['users', 'auth'] },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should accept valid operation mode request', () => {
      const body = {
        specId: 'spec-789',
        selection: { mode: 'operation', operationIds: ['getUser', 'createUser'] },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should throw error when specId is missing', () => {
      const body = { selection: { mode: 'full' } };
      expect(() => validateGenerateTestsBody(body)).toThrow(
        'specId is required'
      );
    });

    it('should throw error when selection is missing', () => {
      const body = { specId: 'spec-123' };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should throw error when mode is invalid', () => {
      const body = {
        specId: 'spec-123',
        selection: { mode: 'invalid' },
      };
      expect(() => validateGenerateTestsBody(body)).toThrow(
        'selection.mode must be one of: tag, full, operation'
      );
    });

    it('should accept tag mode with tags array', () => {
      const body = {
        specId: 'spec-123',
        selection: { mode: 'tag', tags: ['users'] },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should accept operation mode with operationIds', () => {
      const body = {
        specId: 'spec-123',
        selection: { mode: 'operation', operationIds: ['op1'] },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should accept optional options field', () => {
      const body = {
        specId: 'spec-123',
        selection: { mode: 'full' },
        options: { includeNegativeCases: true },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });

    it('should trim whitespace from specId', () => {
      const body = {
        specId: '  spec-999  ',
        selection: { mode: 'full' },
      };
      expect(() => validateGenerateTestsBody(body)).not.toThrow();
    });
  });
});
