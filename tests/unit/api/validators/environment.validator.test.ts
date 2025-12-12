import { validateCreateEnvironmentBody } from '../../../../src/api/validators/environment.validator';

describe('environment.validator', () => {
  describe('validateCreateEnvironmentBody', () => {
    it('should accept valid environment request', () => {
      const body = {
        specId: 'spec-123',
        name: 'dev',
        baseUrl: 'http://localhost:3000',
      };
      expect(() => validateCreateEnvironmentBody(body)).not.toThrow();
    });

    it('should accept environment with optional headers', () => {
      const body = {
        specId: 'spec-123',
        name: 'qa',
        baseUrl: 'https://api.qa.example.com',
        defaultHeaders: { 'x-api-key': 'secret' },
      };
      expect(() => validateCreateEnvironmentBody(body)).not.toThrow();
    });

    it('should throw error when specId is missing', () => {
      const body = { name: 'dev', baseUrl: 'http://localhost:3000' };
      expect(() => validateCreateEnvironmentBody(body)).toThrow(
        'specId is required'
      );
    });

    it('should throw error when name is missing', () => {
      const body = { specId: 'spec-123', baseUrl: 'http://localhost:3000' };
      expect(() => validateCreateEnvironmentBody(body)).toThrow(
        'name is required'
      );
    });

    it('should throw error when baseUrl is missing', () => {
      const body = { specId: 'spec-123', name: 'dev' };
      expect(() => validateCreateEnvironmentBody(body)).toThrow(
        'baseUrl is required'
      );
    });

    it('should accept environment with all valid string fields', () => {
      const body = {
        specId: 'spec-123',
        name: 'prod',
        baseUrl: 'https://api.prod.example.com',
      };
      expect(() => validateCreateEnvironmentBody(body)).not.toThrow();
    });
  });
});
