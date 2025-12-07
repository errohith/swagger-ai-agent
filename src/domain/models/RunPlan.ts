import type { Operation } from './Operation';
import type { TestCaseDefinition } from './TestCaseDefinition';

export type RunStatus = 'planned' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface RunPlan {
  runId: string;
  specId: string;
  envName: string;
  operations: Operation[];
  testCaseDefinitions: TestCaseDefinition[];
  status: RunStatus;
  createdAt?: string;
  updatedAt?: string;
}

export function createRunPlan(input: Partial<RunPlan> & { runId: string; specId: string; envName: string; operations?: Operation[]; testCaseDefinitions?: TestCaseDefinition[] }): RunPlan {
  const now = new Date().toISOString();
  return {
    runId: input.runId,
    specId: input.specId,
    envName: input.envName,
    operations: input.operations ?? [],
    testCaseDefinitions: input.testCaseDefinitions ?? [],
    status: input.status ?? 'planned',
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export default RunPlan;
