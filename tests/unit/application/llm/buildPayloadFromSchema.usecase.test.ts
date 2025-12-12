import { buildPayloadFromSchema } from '../../../../src/application/llm/buildPayloadFromSchema.usecase';
import type { SpecRepository } from '../../../../src/domain/repositories/SpecRepository';
import type { NormalizedSpec } from '../../../../src/domain/models/NormalizedSpec';
import type { Operation } from '../../../../src/domain/models/Operation';

describe('buildPayloadFromSchema usecase', () => {
  let mockSpecRepo: jest.Mocked<SpecRepository>;
  let mockPayloadBuilder: any;

  beforeEach(() => {
    mockSpecRepo = {
      findById: jest.fn(),
      getById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    } as jest.Mocked<SpecRepository>;

    mockPayloadBuilder = {
      buildFromSchema: jest.fn(),
    };
  });

  it('should build basic payload from schema without LLM enrichment', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-1',
      title: 'Test API',
      version: '1.0.0',
      servers: [],
      operationCount: 1,
      operations: [
        {
          operationId: 'createUser',
          method: 'POST',
          path: '/users',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                  },
                  required: ['name', 'email'],
                },
              },
            },
          },
        } as Operation,
      ],
    };

    mockSpecRepo.getById = jest.fn().mockResolvedValue(spec);
    mockPayloadBuilder.buildFromSchema.mockResolvedValue({
      name: 'John Doe',
      email: 'john@example.com',
    });

    const result = await buildPayloadFromSchema(
      'spec-1',
      'createUser',
      {
        specRepo: mockSpecRepo,
        payloadBuilder: mockPayloadBuilder,
      }
    );

    expect(result.examples).toBeDefined();
    expect(result.examples.length).toBeGreaterThan(0);
    expect(result.examples[0].payload).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(mockPayloadBuilder.buildFromSchema).toHaveBeenCalled();
  });

  it('should throw error when spec not found', async () => {
    mockSpecRepo.getById = jest.fn().mockResolvedValue(null);

    await expect(
      buildPayloadFromSchema('spec-999', 'createUser', {
        specRepo: mockSpecRepo,
        payloadBuilder: mockPayloadBuilder,
      })
    ).rejects.toThrow('spec not found: spec-999');
  });

  it('should throw error when operation not found', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-2',
      title: 'Test API',
      version: '1.0.0',
      servers: [],
      operationCount: 1,
      operations: [
        {
          operationId: 'getUsers',
          method: 'GET',
          path: '/users',
        } as Operation,
      ],
    };

    mockSpecRepo.getById = jest.fn().mockResolvedValue(spec);

    await expect(
      buildPayloadFromSchema('spec-2', 'nonExistentOp', {
        specRepo: mockSpecRepo,
        payloadBuilder: mockPayloadBuilder,
      })
    ).rejects.toThrow('operation not found: nonExistentOp');
  });

  it('should handle enriched mode with LLM hints', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-3',
      title: 'Test API',
      version: '1.0.0',
      servers: [],
      operationCount: 1,
      operations: [
        {
          operationId: 'createProduct',
          method: 'POST',
          path: '/products',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'number' },
                  },
                },
              },
            },
          },
        } as Operation,
      ],
    };

    mockSpecRepo.getById = jest.fn().mockResolvedValue(spec);
    mockPayloadBuilder.buildFromSchema.mockResolvedValue({
      name: 'Premium Widget',
      price: 99.99,
    });

    const result = await buildPayloadFromSchema(
      'spec-3',
      'createProduct',
      {
        specRepo: mockSpecRepo,
        payloadBuilder: mockPayloadBuilder,
      }
    );

    expect(result.examples).toBeDefined();
    expect(result.operationId).toBe('createProduct');
  });
});
