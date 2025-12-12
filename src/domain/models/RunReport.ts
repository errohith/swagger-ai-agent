export type TestResultStatus = 'passed' | 'failed' | 'error' | 'skipped';

export interface PerTestResult {
  testId: string;
  operationId: string;
  status: TestResultStatus;
  expectedStatus?: number;
  actualStatus?: number;
  durationMs?: number;
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response?: {
    status?: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  error?: unknown;
}

export interface AggregateStats {
  total: number;
  passed: number;
  failed: number;
  errored: number;
}

export interface RunReport {
  runId: string;
  total: number;
  passed: number;
  failed: number;
  errored: number;
  startedAt?: string;
  finishedAt?: string;
  tests: PerTestResult[];
  aggregates?: {
    byTag?: Record<string, AggregateStats>;
    byMethod?: Record<string, AggregateStats>;
    byPath?: Record<string, AggregateStats>;
  };
}

export function createEmptyRunReport(runId: string): RunReport {
  return {
    runId,
    total: 0,
    passed: 0,
    failed: 0,
    errored: 0,
    tests: [],
  };
}

export default RunReport;
