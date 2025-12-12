import type { RunPlanRepository } from '../../domain/repositories/RunPlanRepository';
import type { SpecRepository } from '../../domain/repositories/SpecRepository';
import type { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import type { RunPlan } from '../../domain/models/RunPlan';
import { createEmptyRunReport, type RunReport, type PerTestResult } from '../../domain/models/RunReport';
import type { TestCaseDefinition } from '../../domain/models/TestCaseDefinition';
import AxiosExecutionAdapter from '../../infrastructure/http/AxiosExecutionAdapter';
import type { AxiosExecutionAdapter as AdapterType } from '../../infrastructure/http/AxiosExecutionAdapter';

export interface ExecuteRunDeps {
  runPlanRepo: RunPlanRepository;
  specRepo: SpecRepository;
  envRepo: EnvironmentRepository;
  axiosAdapter?: typeof AxiosExecutionAdapter;
}

export async function executeRunById(runId: string, deps: ExecuteRunDeps): Promise<RunReport> {
  const { runPlanRepo, specRepo, envRepo, axiosAdapter = AxiosExecutionAdapter } = deps;

  const plan = await runPlanRepo.getById(runId);
  if (!plan) throw new Error(`RunPlan not found: ${runId}`);

  // mark running
  plan.status = 'running';
  await runPlanRepo.update(plan);

  const report = createEmptyRunReport(runId);
  report.startedAt = new Date().toISOString();

  // 2. fetch spec
  const spec = await specRepo.getById(plan.specId);
  if (!spec) throw new NotFoundError(`Spec not found with ID: ${plan.specId}`, { specId: plan.specId, runId });

  // fetch environment
  const envs = await envRepo.listBySpecId(plan.specId);
  const env = envs.find((e) => e.name === plan.envName);
  if (!env) throw new NotFoundError(`Environment '${plan.envName}' not found for spec: ${plan.specId}`, { envName: plan.envName, specId: plan.specId, runId });

  // execute each test case sequentially for now
  for (const tc of plan.testCaseDefinitions ?? []) {
    const result = await executeTestCase(tc, plan, spec, env, axiosAdapter);
    report.tests.push(result);
    report.total += 1;
    if (result.status === 'passed') report.passed += 1;
    else if (result.status === 'failed') report.failed += 1;
    else if (result.status === 'error') report.errored += 1;
  }

  report.finishedAt = new Date().toISOString();

  // finalize plan
  plan.status = 'completed';
  await runPlanRepo.update(plan);

  return report;
}

async function executeTestCase(
  tc: TestCaseDefinition,
  plan: RunPlan,
  spec: any,
  env: any,
  adapter: typeof AdapterType
): Promise<PerTestResult> {
  const op = (plan.operations ?? []).find((o) => o.operationId === tc.operationId) ?? (spec.operations ?? []).find((o: any) => o.operationId === tc.operationId);
  if (!op) {
    return {
      testId: tc.id,
      operationId: tc.operationId,
      status: 'error',
      expectedStatus: tc.expectedStatus,
      actualStatus: undefined,
      durationMs: 0,
      error: `Operation not found: ${tc.operationId}`,
    };
  }

  try {
    const exec = await adapter.executeOperation(op, env, tc.overrides as any);
    const actual = exec.response?.status;
    const passed = actual === tc.expectedStatus;
    const status: 'passed' | 'failed' | 'error' = exec.response ? (passed ? 'passed' : 'failed') : 'error';

    const per: PerTestResult = {
      testId: tc.id,
      operationId: tc.operationId,
      status,
      expectedStatus: tc.expectedStatus,
      actualStatus: actual,
      durationMs: exec.durationMs,
      request: exec.request,
      response: exec.response ?? undefined,
      error: exec.error,
    };

    return per;
  } catch (err) {
    return {
      testId: tc.id,
      operationId: tc.operationId,
      status: 'error',
      expectedStatus: tc.expectedStatus,
      actualStatus: undefined,
      durationMs: 0,
      error: err,
    };
  }
}

export default executeRunById;
