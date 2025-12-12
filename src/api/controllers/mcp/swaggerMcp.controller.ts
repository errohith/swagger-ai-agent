import { Request, Response, NextFunction } from 'express';
import { listOperationsTool } from '../../../infrastructure/mcp/swagger/tools/listOperations.tool';
import { planApiRunTool } from '../../../infrastructure/mcp/swagger/tools/planApiRun.tool';
import { executeOperationTool } from '../../../infrastructure/mcp/swagger/tools/executeOperation.tool';
import { generateAxiosTestsTool } from '../../../infrastructure/mcp/swagger/tools/generateAxiosTests.tool';

export async function listOperationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId } = req.body;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const ops = await listOperationsTool(specId);
    res.json({ operations: ops });
  } catch (err) {
    next(err);
  }
}

export async function planRunHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, envName, selection } = req.body;
    if (!specId || !envName) return res.status(400).json({ error: 'specId and envName required' });
    const result = await planApiRunTool(specId, envName, selection, {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function executeOperationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, envName, operationId, overrides } = req.body;
    if (!specId || !envName || !operationId) return res.status(400).json({ error: 'specId, envName and operationId required' });
    const result = await executeOperationTool(specId, envName, operationId, overrides);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateTestsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { specId, selection, options } = req.body;
    if (!specId) return res.status(400).json({ error: 'specId required' });
    const result = await generateAxiosTestsTool(specId, selection, options);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export default { listOperationsHandler, planRunHandler, executeOperationHandler, generateTestsHandler };
