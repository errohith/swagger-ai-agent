import { Request, Response, NextFunction } from 'express';
import { validateImportSpecBody } from '../validators/spec.validator';
import { ingestSwagger } from '../../application/spec/ingestSwagger.usecase';
import InMemorySpecRepository from '../../infrastructure/persistence/InMemorySpecRepository';
import SwaggerLoader from '../../infrastructure/swagger/SwaggerLoader';
import SwaggerParserAdapter from '../../infrastructure/swagger/SwaggerParserAdapter';
import { validateSpec } from '../../application/spec/validateSpec.usecase';

const repo = new InMemorySpecRepository();

export async function importSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = validateImportSpecBody(req.body);
    const result = await ingestSwagger(body.source as any, repo as any);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function validateSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    let parsed: any = null;
    if (body.specId) {
      const spec = await repo.getById(body.specId);
      if (!spec) return res.status(404).json({ error: 'spec not found' });
      parsed = spec.raw;
    } else if (body.raw) {
      parsed = body.raw;
    } else if (body.source) {
      const src = body.source;
      if (src.type === 'url') {
        const rawText = await SwaggerLoader.loadFromUrl(src.url);
        parsed = await SwaggerParserAdapter.parse(rawText as string);
      } else if (src.type === 'file') {
        const rawText = await SwaggerLoader.loadFromFile(src.path);
        parsed = await SwaggerParserAdapter.parse(rawText as string);
      } else {
        return res.status(400).json({ error: 'unsupported source for validation' });
      }
    } else {
      return res.status(400).json({ error: 'must provide specId, raw, or source' });
    }

    const result = validateSpec(parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const spec = await repo.getById(specId);
    if (!spec) return res.status(404).json({ error: 'spec not found' });
    res.json({ id: spec.id, title: spec.title, version: spec.version, servers: spec.servers, operationCount: spec.operationCount, tags: spec.tags });
  } catch (err) {
    next(err);
  }
}

export async function listOperationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const specId = req.params.specId;
    const spec = await repo.getById(specId);
    if (!spec) return res.status(404).json({ error: 'spec not found' });
    res.json(spec.operations.map((op: any) => ({ operationId: op.operationId, method: op.method, path: op.path, tags: op.tags ?? [], summary: op.summary })));
  } catch (err) {
    next(err);
  }
}

export default { importSpecHandler, validateSpecHandler, getSpecHandler, listOperationsHandler };
