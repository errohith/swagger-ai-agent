import OpenApiNormalizer from '../../../src/infrastructure/swagger/OpenApiNormalizer';
import type { NormalizedSpec } from '../../../src/domain/models/NormalizedSpec';

describe('OpenApiNormalizer', () => {
  it('should normalize OpenAPI 3.0 spec', () => {
    const openApiSpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      servers: [{ url: 'https://api.example.com' }],
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get all users',
            tags: ['users'],
            responses: {
              '200': { description: 'Success' },
            },
          },
        },
      },
    };

    const normalized = OpenApiNormalizer.normalize(openApiSpec, 'spec-1');

    expect(normalized.id).toBe('spec-1');
    expect(normalized.title).toBe('Test API');
    expect(normalized.version).toBe('1.0.0');
    expect(normalized.operations).toHaveLength(1);
    expect(normalized.operations[0].operationId).toBe('getUsers');
    expect(normalized.operations[0].method).toBe('GET');
    expect(normalized.operations[0].path).toBe('/users');
  });

  it('should normalize Swagger 2.0 spec', () => {
    const swaggerSpec = {
      swagger: '2.0',
      info: { title: 'Legacy API', version: '2.0.0' },
      host: 'api.legacy.com',
      basePath: '/v2',
      paths: {
        '/products': {
          post: {
            operationId: 'createProduct',
            summary: 'Create product',
            tags: ['products'],
            responses: {
              '201': { description: 'Created' },
            },
          },
        },
      },
    };

    const normalized = OpenApiNormalizer.normalize(swaggerSpec, 'spec-2');

    expect(normalized.id).toBe('spec-2');
    expect(normalized.title).toBe('Legacy API');
    expect(normalized.version).toBe('2.0.0');
    expect(normalized.operations).toHaveLength(1);
    expect(normalized.operations[0].operationId).toBe('createProduct');
    expect(normalized.operations[0].method).toBe('POST');
  });

  it('should extract multiple operations from multiple paths', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Multi API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { operationId: 'getUsers', responses: {} },
          post: { operationId: 'createUser', responses: {} },
        },
        '/orders': {
          get: { operationId: 'getOrders', responses: {} },
        },
      },
    };

    const normalized = OpenApiNormalizer.normalize(spec, 'spec-3');

    expect(normalized.operations).toHaveLength(3);
    expect(normalized.operations.map((op) => op.operationId)).toEqual([
      'getUsers',
      'createUser',
      'getOrders',
    ]);
  });

  it('should handle spec with no operations', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Empty API', version: '1.0.0' },
      paths: {},
    };

    const normalized = OpenApiNormalizer.normalize(spec, 'spec-4');

    expect(normalized.operations).toHaveLength(0);
  });

  it('should extract tags from operations', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'Tagged API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            tags: ['users', 'public'],
            responses: {},
          },
        },
      },
    };

    const normalized = OpenApiNormalizer.normalize(spec, 'spec-5');

    expect(normalized.operations[0].tags).toEqual(['users', 'public']);
  });

  it('should handle operations without operationId', () => {
    const spec = {
      openapi: '3.0.0',
      info: { title: 'No OpId API', version: '1.0.0' },
      paths: {
        '/ping': {
          get: {
            summary: 'Health check',
            responses: {},
          },
        },
      },
    };

    const normalized = OpenApiNormalizer.normalize(spec, 'spec-6');

    expect(normalized.operations).toHaveLength(1);
    expect(normalized.operations[0].operationId).toContain('GET');
    expect(normalized.operations[0].operationId).toContain('/ping');
  });
});
