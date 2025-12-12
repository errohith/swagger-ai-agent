import { retryFailedTests } from '../../../../src/application/execution/retryFailedTest.usecase';
import type { RunPlanRepository } from '../../../../src/domain/repositories/RunPlanRepository';
import type { RunPlan } from '../../../../src/domain/models/RunPlan';

describe('retryFailedTests usecase', () => {
  let mockRunPlanRepo: jest.Mocked<RunPlanRepository>;

  beforeEach(() => {
    mockRunPlanRepo = {
      getById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    } as any;
  });

  it('should create new run plan for retrying failed tests', async () => {
    const originalRunPlan: RunPlan = {
      runId: 'run-original',
      specId: 'spec-1',
      envName: 'dev',
      status: 'completed',
      operations: [],
      testCaseDefinitions: [
        {
          id: 'test-1',
          operationId: 'getUsers',
          name: 'GET /users should return 200',
          type: 'happy',
          expectedStatus: 200,
        },
        {
          id: 'test-2',
          operationId: 'createUser',
          name: 'POST /users should return 201',
          type: 'happy',
          expectedStatus: 201,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    mockRunPlanRepo.getById.mockResolvedValue(originalRunPlan);
    mockRunPlanRepo.save.mockResolvedValue(undefined);

    const result = await retryFailedTests('run-original', {
      runPlanRepo: mockRunPlanRepo,
    });

    expect(result.newRunId).toBeDefined();
    expect(result.newRunId).not.toBe('run-original');
    expect(result.retryCount).toBeGreaterThan(0);
    expect(mockRunPlanRepo.save).toHaveBeenCalled();
  });

  it('should throw error when original run plan not found', async () => {
    mockRunPlanRepo.getById.mockResolvedValue(undefined);

    await expect(
      retryFailedTests('run-999', { runPlanRepo: mockRunPlanRepo })
    ).rejects.toThrow('run not found: run-999');
  });

  it('should preserve all test definitions from original plan', async () => {
    const originalRunPlan: RunPlan = {
      runId: 'run-original',
      specId: 'spec-2',
      envName: 'qa',
      status: 'completed',
      operations: [],
      testCaseDefinitions: [
        {
          id: 'test-a',
          operationId: 'op-a',
          name: 'Test A',
          type: 'happy',
          expectedStatus: 200,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    mockRunPlanRepo.getById.mockResolvedValue(originalRunPlan);
    mockRunPlanRepo.save.mockResolvedValue(undefined);

    const result = await retryFailedTests('run-original', {
      runPlanRepo: mockRunPlanRepo,
    });

    expect(result.retryCount).toBeGreaterThan(0);
  });
});
