export type TestType = 'happy' | 'negative' | 'auth' | 'boundary' | 'custom';

export interface TestCaseDefinition {
  id: string;
  operationId: string;
  name: string;
  type: TestType;
  expectedStatus: number;
  payloadStrategy?: 'example' | 'schema' | 'llm' | 'none';
  overrides?: {
    pathParams?: Record<string, unknown>;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}

export function createTestCaseDefinition(input: Partial<TestCaseDefinition> & { id: string; operationId: string; name: string; type: TestType; expectedStatus: number }): TestCaseDefinition {
  return {
    id: input.id,
    operationId: input.operationId,
    name: input.name,
    type: input.type,
    expectedStatus: input.expectedStatus,
    payloadStrategy: input.payloadStrategy ?? 'none',
    overrides: input.overrides,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export default TestCaseDefinition;
