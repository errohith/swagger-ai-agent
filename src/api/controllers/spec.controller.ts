import { Request, Response, NextFunction } from 'express';
import { validateImportSpecBody } from '../validators/spec.validator';
import { ingestSwagger } from '../../application/spec/ingestSwagger.usecase';
import SwaggerLoader from '../../infrastructure/swagger/SwaggerLoader';
import SwaggerParserAdapter from '../../infrastructure/swagger/SwaggerParserAdapter';
import { validateSpec } from '../../application/spec/validateSpec.usecase';
import OpenApiNormalizer from '../../infrastructure/swagger/OpenApiNormalizer';
import { createNormalizedSpec } from '../../domain/models/NormalizedSpec';
import { createOperation } from '../../domain/models/Operation';
import RepositoryFactory from '../../infrastructure/persistence/RepositoryFactory';

const repo = RepositoryFactory.getSpecRepository();

// Helper function to ingest from already-parsed spec
async function ingestSwaggerFromParsed(parsed: any, repository: any) {
  const normalized = OpenApiNormalizer.normalize(parsed);
  
  const domainOperations = (normalized.operations ?? []).map((op: any) =>
    createOperation({
      operationId: op.operationId,
      method: op.method as any,
      path: op.path,
      tags: op.tags ?? [],
      summary: op.summary,
    })
  );

  const servers = (normalized.servers ?? []).map((s: any) =>
    typeof s === 'string' ? { url: s } : s
  );

  const domainSpec = createNormalizedSpec({
    id: normalized.id || `spec-${Date.now()}`,
    title: normalized.title ?? 'untitled',
    version: normalized.version ?? 'unknown',
    servers,
    operations: domainOperations,
    raw: normalized.raw ?? parsed,
  });

  await repository.save(domainSpec);

  return {
    specId: domainSpec.id,
    title: domainSpec.title,
    version: domainSpec.version,
    operationCount: domainSpec.operationCount,
  };
}

export async function importSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = validateImportSpecBody(req.body);
    
    let result;
    // Handle direct content upload
    if ('specContent' in body) {
      // Parse the content directly without file system
      const parsed = await SwaggerParserAdapter.parse(body.specContent);
      result = await ingestSwaggerFromParsed(parsed, repo as any);
    } else {
      // Handle source-based upload (url, file, git)
      result = await ingestSwagger(body.source as any, repo as any);
    }
    
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function validateSpecHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    let parsed: any = null;
    
    // Support direct content validation
    if (body.specContent && typeof body.specContent === 'string') {
      parsed = await SwaggerParserAdapter.parse(body.specContent);
    } else if (body.specId) {
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
      return res.status(400).json({ error: 'must provide specId, raw, specContent, or source' });
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

export async function listSpecsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const specs = await repo.list();
    res.json(specs.map((spec: any) => ({
      id: spec.id,
      title: spec.title,
      version: spec.version,
      description: spec.raw?.info?.description || '',
      format: 'json', // Default to json format
      createdAt: spec.createdAt || new Date().toISOString(),
      updatedAt: spec.updatedAt || new Date().toISOString(),
      servers: spec.servers,
      operationCount: spec.operationCount,
      tags: spec.tags
    })));
  } catch (err) {
    next(err);
  }
}

export default { importSpecHandler, validateSpecHandler, getSpecHandler, listOperationsHandler, listSpecsHandler };
