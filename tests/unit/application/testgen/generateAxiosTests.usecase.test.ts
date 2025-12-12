import { generateAxiosTestsFromSpec } from '../../../../src/application/testgen/generateAxiosTests.usecase';
import type { SpecRepository } from '../../../../src/domain/repositories/SpecRepository';
import type { NormalizedSpec } from '../../../../src/domain/models/NormalizedSpec';
import type { Operation } from '../../../../src/domain/models/Operation';

describe('generateAxiosTestsFromSpec usecase', () => {
  let mockSpecRepo: jest.Mocked<SpecRepository>;

  beforeEach(() => {
    mockSpecRepo = {
      getById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    } as any;
  });

  it('should generate tests for full spec mode', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-1',
      title: 'Test API',
      version: '1.0.0',
      servers: [],
      operationCount: 2,
      operations: [
        {
          operationId: 'getUsers',
          method: 'GET',
          path: '/users',
          tags: ['users'],
          summary: 'Get all users',
        } as Operation,
        {
          operationId: 'createUser',
          method: 'POST',
          path: '/users',
          tags: ['users'],
          summary: 'Create user',
        } as Operation,
      ],
    };

    mockSpecRepo.getById.mockResolvedValue(spec);

    const result = await generateAxiosTestsFromSpec(
      'spec-1',
      mockSpecRepo
    );

    expect(result.code).toContain("describe('");
    expect(result.code).toContain('/users');
    expect(result.code).toContain('getUsers');
    expect(result.code).toContain('createUser');
    expect(result.tests).toHaveLength(2);
    expect(result.tests[0].operationId).toBe('getUsers');
    expect(result.tests[1].operationId).toBe('createUser');
  });

  it('should generate tests for specific tag', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-2',
      title: 'Multi-tag API',
      version: '1.0.0',
      servers: [],
      operationCount: 2,
      operations: [
        {
          operationId: 'getUsers',
          method: 'GET',
          path: '/users',
          tags: ['users'],
        } as Operation,
        {
          operationId: 'getOrders',
          method: 'GET',
          path: '/orders',
          tags: ['orders'],
        } as Operation,
      ],
    };

    mockSpecRepo.getById.mockResolvedValue(spec);

    const result = await generateAxiosTestsFromSpec(
      'spec-2',
      mockSpecRepo,
      { mode: 'tag', tags: ['users'] }
    );

    expect(result.code).toContain('/users');
    expect(result.code).toContain('getUsers');
    expect(result.code).not.toContain('getOrders');
    expect(result.tests).toHaveLength(1);
  });

  it('should generate tests for specific operation IDs', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-3',
      title: 'Selective API',
      version: '1.0.0',
      servers: [],
      operationCount: 3,
      operations: [
        {
          operationId: 'getUsers',
          method: 'GET',
          path: '/users',
          tags: ['users'],
        } as Operation,
        {
          operationId: 'createUser',
          method: 'POST',
          path: '/users',
          tags: ['users'],
        } as Operation,
        {
          operationId: 'deleteUser',
          method: 'DELETE',
          path: '/users/{id}',
          tags: ['users'],
        } as Operation,
      ],
    };

    mockSpecRepo.getById.mockResolvedValue(spec);

    const result = await generateAxiosTestsFromSpec(
      'spec-3',
      mockSpecRepo,
      { mode: 'operation', operationIds: ['getUsers', 'deleteUser'] }
    );

    expect(result.code).toContain('/users');
    expect(result.code).toContain('getUsers');
    expect(result.code).toContain('deleteUser');
    expect(result.code).not.toContain('createUser');
    expect(result.tests).toHaveLength(2);
    expect(result.tests).toHaveLength(2);
  });

  it('should throw error when spec not found', async () => {
    mockSpecRepo.getById.mockResolvedValue(undefined);

    await expect(
      generateAxiosTestsFromSpec('spec-999', mockSpecRepo)
    ).rejects.toThrow('spec not found: spec-999');
  });

  it('should include axios imports and test setup in generated code', async () => {
    const spec: NormalizedSpec = {
      id: 'spec-4',
      title: 'Basic API',
      version: '1.0.0',
      servers: [],
      operationCount: 1,
      operations: [
        {
          operationId: 'ping',
          method: 'GET',
          path: '/ping',
          tags: ['health'],
        } as Operation,
      ],
    };

    mockSpecRepo.getById.mockResolvedValue(spec);

    const result = await generateAxiosTestsFromSpec(
      'spec-4',
      mockSpecRepo
    );

    expect(result.code).toContain("axios");
    expect(result.code).toContain("baseUrl");
    expect(result.code).toContain("describe(");
    expect(result.code).toContain("it(");
    expect(result.code).toContain("expect(");
  });
});
