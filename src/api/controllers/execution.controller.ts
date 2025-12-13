import { Request, Response, NextFunction } from 'express';
import { executeRunById } from '../../application/execution/executeRun.usecase';
import { retryFailedTests } from '../../application/execution/retryFailedTest.usecase';
import { validateRunRequest, validateRetryFailedRequest } from '../validators/execution.validator';
import Logger from '../../infrastructure/logging/Logger';
import RepositoryFactory from '../../infrastructure/persistence/RepositoryFactory';

const runPlanRepo = RepositoryFactory.getRunPlanRepository();
const specRepo = RepositoryFactory.getSpecRepository();
const envRepo = RepositoryFactory.getEnvironmentRepository();

/**
 * Execute a run plan by runId
 */
export async function runHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = validateRunRequest(req.body);
    Logger.info('execution:run:start', { runId: validated.runId });

    const report = await executeRunById(validated.runId, { runPlanRepo, specRepo, envRepo });
    
    Logger.info('execution:run:complete', { runId: validated.runId, total: report.total, passed: report.passed, failed: report.failed });
    res.json(report);
  } catch (err) {
    Logger.error('execution:run:error', { error: err });
    next(err);
  }
}

export async function statusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const runId = req.params.runId;
    const plan = await runPlanRepo.getById(runId);
    if (!plan) return res.status(404).json({ error: 'run not found' });
    res.json({ runId: plan.runId, status: plan.status, createdAt: plan.createdAt, updatedAt: plan.updatedAt });
  } catch (err) {
    next(err);
  }
}

export async function listExecutionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.query.specId as string | undefined;
    const plans = await runPlanRepo.list();
    
    // Filter by specId if provided
    const filtered = specId ? plans.filter(p => p.specId === specId) : plans;
    
    Logger.info('execution:list', { count: filtered.length, specId });
    res.json(filtered);
  } catch (err) {
    Logger.error('execution:list:error', { error: err });
    next(err);
  }
}

export async function getExecutionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const runId = req.params.runId;
    const plan = await runPlanRepo.getById(runId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    Logger.info('execution:get', { runId });
    res.json(plan);
  } catch (err) {
    Logger.error('execution:get:error', { error: err });
    next(err);
  }
}

/**
 * Retry failed tests from a previous run
 */
export async function retryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = validateRetryFailedRequest(req.body);
    Logger.info('execution:retry:start', { originalRunId: validated.runId });

    const result = await retryFailedTests(validated.runId, { runPlanRepo });
    
    Logger.info('execution:retry:complete', { originalRunId: validated.runId, newRunId: result.newRunId, retryCount: result.retryCount });
    res.json(result);
  } catch (err) {
    Logger.error('execution:retry:error', { error: err });
    next(err);
  }
}

export default { 
  runHandler, 
  statusHandler, 
  retryHandler,
  listExecutionsHandler,
  getExecutionHandler,
};
