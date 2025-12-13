import { apiClient } from './client';

export interface TestCase {
  id: string;
  operationId: string;
  path: string;
  method: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

export interface RunPlan {
  id: string;
  specId: string;
  environmentId: string;
  operationIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionResult {
  runId: string;
  specId: string;
  environmentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  testCases: TestCase[];
  startedAt: string;
  completedAt?: string;
}

export interface ExecuteRunRequest {
  specId: string;
  environmentId: string;
  operationIds?: string[];
}

export interface RetryFailedRequest {
  runId: string;
}

export const executionService = {
  // Execute run plan
  executeRun: async (data: ExecuteRunRequest): Promise<ExecutionResult> => {
    const response = await apiClient.post('/execution/execute', data);
    return response.data;
  },

  // Get execution result
  getExecutionResult: async (runId: string): Promise<ExecutionResult> => {
    const response = await apiClient.get(`/execution/${runId}`);
    return response.data;
  },

  // List execution results
  listExecutions: async (specId?: string): Promise<ExecutionResult[]> => {
    const url = specId ? `/execution?specId=${specId}` : '/execution';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Retry failed tests
  retryFailed: async (data: RetryFailedRequest): Promise<ExecutionResult> => {
    const response = await apiClient.post('/execution/retry', data);
    return response.data;
  },

  // Delete execution result
  deleteExecution: async (runId: string): Promise<void> => {
    await apiClient.delete(`/execution/${runId}`);
  },
};
