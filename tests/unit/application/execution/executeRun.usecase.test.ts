import { executeRunById } from '../../../../src/application/execution/executeRun.usecase';
import type { RunPlanRepository } from '../../../../src/domain/repositories/RunPlanRepository';
import type { SpecRepository } from '../../../../src/domain/repositories/SpecRepository';
import type { EnvironmentRepository } from '../../../../src/domain/repositories/EnvironmentRepository';
import type { RunPlan } from '../../../../src/domain/models/RunPlan';
import type { NormalizedSpec } from '../../../../src/domain/models/NormalizedSpec';
import type { EnvironmentConfig } from '../../../../src/domain/models/EnvironmentConfig';
import type { Operation } from '../../../../src/domain/models/Operation';

describe('executeRunById usecase', () => {
  let mockRunPlanRepo: jest.Mocked<RunPlanRepository>;
  let mockSpecRepo: jest.Mocked<SpecRepository>;
  let mockEnvRepo: jest.Mocked<EnvironmentRepository>;
  let mockExecutionAdapter: any;

  beforeEach(() => {
    mockRunPlanRepo = {
      getById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    } as any;

    mockSpecRepo = {
      getById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    } as any;

    mockEnvRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      listBySpecId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockExecutionAdapter = {
      executeOperation: jest.fn(),
    };
  });

  it('should execute run plan successfully and return report', async () => {
    const runPlan: RunPlan = {
      runId: 'run-123',
      specId: 'spec-1',
      envName: 'dev',
      status: 'planned',
      operations: [],
      testCaseDefinitions: [
        {
          id: 'test-1',
          operationId: 'getUsers',
          name: 'GET /users should return 200',
          type: 'happy',
          expectedStatus: 200,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const spec: NormalizedSpec = {
      id: 'spec-1',
      title: 'Test API',
      version: '1.0.0',
      servers: [],
      operationCount: 1,
      operations: [
        {
          operationId: 'getUsers',
          method: 'GET',
          path: '/users',
          tags: ['users'],
        } as Operation,
      ],
    };

    const env: EnvironmentConfig = {
      id: 'env-1',
      specId: 'spec-1',
      name: 'dev',
      baseUrl: 'http://localhost:3000',
    };

    mockRunPlanRepo.getById.mockResolvedValue(runPlan);
    mockSpecRepo.getById.mockResolvedValue(spec);
    mockEnvRepo.listBySpecId.mockResolvedValue([env]);

    mockExecutionAdapter.executeOperation.mockResolvedValue({
      request: { method: 'GET', url: 'http://localhost:3000/users', headers: {}, body: null },
      response: { status: 200, headers: {}, data: [] },
      durationMs: 150,
      error: null,
    });

    const report = await executeRunById('run-123', {
      runPlanRepo: mockRunPlanRepo,
      specRepo: mockSpecRepo,
      envRepo: mockEnvRepo,
      axiosAdapter: mockExecutionAdapter,
    });

    expect(report.runId).toBe('run-123');
    expect(report.total).toBe(1);
    expect(report.passed).toBe(1);
    expect(report.failed).toBe(0);
    expect(mockRunPlanRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'completed' })
    );
  });

  it('should mark test as failed when status does not match', async () => {
    const runPlan: RunPlan = {
      runId: 'run-456',
      specId: 'spec-1',
      envName: 'dev',
      status: 'planned',
      operations: [],
      testCaseDefinitions: [
        {
          id: 'test-2',
          operationId: 'getUsers',
          name: 'GET /users should return 200',
          type: 'happy',
          expectedStatus: 200,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const spec: NormalizedSpec = {
      id: 'spec-1',
      title: 'Test API',
      version: '1.0.0',
      servers: [],
      operationCount: 1,
      operations: [
        {
          operationId: 'getUsers',
          method: 'GET',
          path: '/users',
          tags: ['users'],
        } as Operation,
      ],
    };

    const env: EnvironmentConfig = {
      id: 'env-1',
      specId: 'spec-1',
      name: 'dev',
      baseUrl: 'http://localhost:3000',
    };

    mockRunPlanRepo.getById.mockResolvedValue(runPlan);
    mockSpecRepo.getById.mockResolvedValue(spec);
    mockEnvRepo.listBySpecId.mockResolvedValue([env]);

    mockExecutionAdapter.executeOperation.mockResolvedValue({
      request: { method: 'GET', url: 'http://localhost:3000/users', headers: {}, body: null },
      response: { status: 500, headers: {}, data: { error: 'Internal Server Error' } },
      durationMs: 100,
      error: null,
    });

    const report = await executeRunById('run-456', {
      runPlanRepo: mockRunPlanRepo,
      specRepo: mockSpecRepo,
      envRepo: mockEnvRepo,
      axiosAdapter: mockExecutionAdapter,
    });

    expect(report.total).toBe(1);
    expect(report.passed).toBe(0);
    expect(report.failed).toBe(1);
    expect(report.tests[0].status).toBe('failed');
    expect(report.tests[0].expectedStatus).toBe(200);
    expect(report.tests[0].actualStatus).toBe(500);
  });

  it('should throw error when run plan not found', async () => {
    mockRunPlanRepo.getById.mockResolvedValue(undefined);

    await expect(
      executeRunById('run-999', {
        runPlanRepo: mockRunPlanRepo,
        specRepo: mockSpecRepo,
        envRepo: mockEnvRepo,
        axiosAdapter: mockExecutionAdapter,
      })
    ).rejects.toThrow('RunPlan not found: run-999');
  });
});
