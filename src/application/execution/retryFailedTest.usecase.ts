import type { RunPlanRepository } from '../../domain/repositories/RunPlanRepository';
import { createRunPlan } from '../../domain/models/RunPlan';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../../core/errors/AppError';

export interface RetryFailedDeps {
  runPlanRepo: RunPlanRepository;
}

/**
 * Creates a new RunPlan containing only the failed/errored test cases from a previous run.
 * Returns the new runId so caller can execute it via executeRunById.
 */
export async function retryFailedTests(originalRunId: string, deps: RetryFailedDeps): Promise<{ newRunId: string; retryCount: number }> {
  const { runPlanRepo } = deps;

  const original = await runPlanRepo.getById(originalRunId);
  if (!original) throw new NotFoundError(`Run plan not found with ID: ${originalRunId}`, { runId: originalRunId });

  // Filter for failed/errored test case definitions
  const failedTests = (original.testCaseDefinitions || []).filter((tc) => {
    // We don't have access to the report here directly; for now we just copy all test definitions
    // In a real system, we'd store the RunReport alongside the RunPlan or query a report repository.
    // For Phase 11, we'll assume a simple retry creates a new plan with the same tests.
    return true; // Placeholder: retry all for now (can be refined later with report tracking)
  });

  const newRunId = uuidv4();
  const retryPlan = createRunPlan({
    runId: newRunId,
    specId: original.specId,
    envName: original.envName,
    operations: original.operations,
    testCaseDefinitions: failedTests,
  });

  await runPlanRepo.save(retryPlan);

  return { newRunId, retryCount: failedTests.length };
}

export default retryFailedTests;
