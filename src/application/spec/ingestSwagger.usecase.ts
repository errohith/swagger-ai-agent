import SwaggerLoader, { SpecSource } from '../../infrastructure/swagger/SwaggerLoader';
import SwaggerParserAdapter from '../../infrastructure/swagger/SwaggerParserAdapter';
import OpenApiNormalizer from '../../infrastructure/swagger/OpenApiNormalizer';
import type { SpecRepository } from '../../domain/repositories/SpecRepository';
import { createNormalizedSpec } from '../../domain/models/NormalizedSpec';
import { createOperation } from '../../domain/models/Operation';
import { ValidationError, SpecParseError } from '../../core/errors/AppError';

export type IngestResult = {
  specId: string;
  title: string;
  version: string;
  operationCount: number;
};

/**
 * Ingest a Swagger/OpenAPI spec from the given source, normalize and persist it.
 * This is a Phase 4 micro-implementation that composes Phase 3 adapters.
 */
export async function ingestSwagger(source: SpecSource, repo: SpecRepository): Promise<IngestResult> {
  if (!source || !repo) throw new ValidationError('ingestSwagger requires source and repo');

  // 1. Load raw content
  let rawText: string;
  if (source.type === 'url') {
    rawText = await SwaggerLoader.loadFromUrl(source.url);
  } else if (source.type === 'file') {
    rawText = await SwaggerLoader.loadFromFile(source.path);
  } else if (source.type === 'git') {
    // delegate to loader (currently stubbed)
    rawText = await SwaggerLoader.loadFromGit({ repo: source.repo, ref: source.ref, filePath: source.filePath });
  } else {
    throw new ValidationError('Unsupported spec source type', { sourceType: (source as any).type });
  }

  // 2. Parse into JS object
  const parsed = await SwaggerParserAdapter.parse(rawText as string);

  // 3. Normalize into a minimal spec
  const normalized = OpenApiNormalizer.normalize(parsed);

  // 4. Map to domain NormalizedSpec shape and persist
  const domainOperations = (normalized.operations ?? []).map((op: any) =>
    createOperation({ operationId: op.operationId, method: op.method as any, path: op.path, tags: op.tags ?? [], summary: op.summary }),
  );

  const servers = (normalized.servers ?? []).map((s: any) => (typeof s === 'string' ? { url: s } : s));

  const domainSpec = createNormalizedSpec({
    id: normalized.id || `spec-${Date.now()}`,
    title: normalized.title ?? 'untitled',
    version: normalized.version ?? 'unknown',
    servers,
    operations: domainOperations,
    raw: normalized.raw ?? parsed,
  });

  await repo.save(domainSpec);

  return { specId: domainSpec.id, title: domainSpec.title, version: domainSpec.version, operationCount: domainSpec.operationCount };
}

export default ingestSwagger;
