import { v4 as uuidv4 } from 'uuid';
import InMemorySpecRepository from '../../../../infrastructure/persistence/InMemorySpecRepository';
import InMemoryEnvironmentRepository from '../../../../infrastructure/persistence/InMemoryEnvironmentRepository';
import InMemoryRunPlanRepository from '../../../../infrastructure/persistence/InMemoryRunPlanRepository';
import { createRunPlan } from '../../../../domain/models/RunPlan';
import { generateAxiosTestsFromSpec } from '../../../../application/testgen/generateAxiosTests.usecase';

export async function planApiRunTool(specId: string, envName: string, selection?: any, options?: any) {
  const specRepo = new InMemorySpecRepository();
  const envRepo = new InMemoryEnvironmentRepository();
  const runRepo = new InMemoryRunPlanRepository();

  const spec = await specRepo.getById(specId);
  if (!spec) throw new Error(`spec not found: ${specId}`);

  const envs = await envRepo.listBySpecId(specId);
  const env = envs.find((e) => e.name === envName);
  if (!env) throw new Error(`environment not found: ${envName}`);

  // Use test generator to produce testcases for selected operations
  const gen = await generateAxiosTestsFromSpec(specId, specRepo as any, selection, options);

  const runId = uuidv4();
  const plan = createRunPlan({ runId, specId, envName, operations: spec.operations ?? [], testCaseDefinitions: gen.tests as any });

  await runRepo.save(plan);

  return { runId, specId, envName, operationCount: plan.operations.length, testCount: plan.testCaseDefinitions.length };
}

export default planApiRunTool;
