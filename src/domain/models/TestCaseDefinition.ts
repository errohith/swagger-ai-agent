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
  /** Response extraction configuration for API chaining */
  extraction?: {
    enabled: boolean;
    rules: Array<{
      variableName: string;
      strategy: 'jsonPath' | 'jqPath' | 'regex' | 'header' | 'statusCode' | 'fullBody';
      expression: string;
      defaultValue?: any;
      transform?: 'toString' | 'toNumber' | 'toBoolean' | 'toArray' | 'toLowerCase' | 'toUpperCase';
      validation?: {
        type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
        pattern?: string;
        required?: boolean;
      };
    }>;
    scope?: 'test' | 'run' | 'global';
    continueOnError?: boolean;
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
