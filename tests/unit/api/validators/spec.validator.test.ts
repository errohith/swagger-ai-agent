import { validateImportSpecBody } from '../../../../src/api/validators/spec.validator';

describe('spec.validator', () => {
  describe('validateImportSpecBody', () => {
    it('should accept valid URL source', () => {
      const body = { source: { type: 'url', url: 'https://example.com/swagger.json' } };
      expect(() => validateImportSpecBody(body)).not.toThrow();
    });

    it('should accept valid file source', () => {
      const body = { source: { type: 'file', path: '/path/to/spec.json' } };
      expect(() => validateImportSpecBody(body)).not.toThrow();
    });

    it('should throw error when source is missing', () => {
      const body = {};
      expect(() => validateImportSpecBody(body)).toThrow('Missing `source` object');
    });

    it('should throw error when source type is invalid', () => {
      const body = { source: { type: 'invalid' } };
      expect(() => validateImportSpecBody(body)).toThrow(
        'source.type must be one of: url, file, git'
      );
    });

    it('should throw error when URL source missing url field', () => {
      const body = { source: { type: 'url' } };
      expect(() => validateImportSpecBody(body)).toThrow(
        'source.url is required for type=url'
      );
    });

    it('should throw error when file source missing path field', () => {
      const body = { source: { type: 'file' } };
      expect(() => validateImportSpecBody(body)).toThrow(
        'source.path is required for type=file'
      );
    });

    it('should accept git source with required fields', () => {
      const body = { source: { type: 'git', repo: 'user/repo', filePath: 'swagger.json' } };
      expect(() => validateImportSpecBody(body)).not.toThrow();
    });
  });
});
