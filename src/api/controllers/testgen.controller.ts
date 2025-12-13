import { Request, Response, NextFunction } from 'express';
import { generateAxiosTestsFromSpec } from '../../application/testgen/generateAxiosTests.usecase';
import { validateGenerateTestsBody } from '../validators/testgen.validator';
import Logger from '../../infrastructure/logging/Logger';
import RepositoryFactory from '../../infrastructure/persistence/RepositoryFactory';

const specRepo = RepositoryFactory.getSpecRepository();

/**
 * Generate Axios+Jest test code from spec
 */
export async function generateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = validateGenerateTestsBody(req.body);
    Logger.info('testgen:generate:start', { specId: validated.specId });

    const result = await generateAxiosTestsFromSpec(validated.specId, specRepo, validated.selection, validated.options);
    
    Logger.info('testgen:generate:complete', { specId: validated.specId, testCount: result.tests.length });
    
    // Get spec to extract title for filename
    const spec = await specRepo.getById(validated.specId);
    const specTitle = spec?.title || 'api';
    
    // Format response to match frontend expectations
    res.json({
      testCode: result.code,
      fileName: `${specTitle}.test.js`,
      operationCount: result.tests.length
    });
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
