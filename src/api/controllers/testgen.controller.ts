import { Request, Response, NextFunction } from 'express';
import InMemorySpecRepository from '../../infrastructure/persistence/InMemorySpecRepository';
import { generateAxiosTestsFromSpec } from '../../application/testgen/generateAxiosTests.usecase';
import { validateGenerateTestsBody } from '../validators/testgen.validator';
import Logger from '../../infrastructure/logging/Logger';

const specRepo = new InMemorySpecRepository();

/**
 * Generate Axios+Jest test code from spec
 */
export async function generateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = validateGenerateTestsBody(req.body);
    Logger.info('testgen:generate:start', { specId: validated.specId });

    const result = await generateAxiosTestsFromSpec(validated.specId, specRepo, validated.selection, validated.options);
    
    Logger.info('testgen:generate:complete', { specId: validated.specId, testCount: result.tests.length });
    res.json(result);
  } catch (err) {
    Logger.error('testgen:generate:error', { error: err });
    next(err);
  }
}

export async function previewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const result = await generateAxiosTestsFromSpec(specId, specRepo, { mode: 'full' }, {});
    res.json({ code: result.code, tests: result.tests.map((t) => ({ id: t.id, name: t.name, operationId: t.operationId })) });
  } catch (err) {
    next(err);
  }
}

export default { generateHandler, previewHandler };
