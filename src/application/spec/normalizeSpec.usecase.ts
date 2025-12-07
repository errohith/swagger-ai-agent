import OpenApiNormalizer from '../../infrastructure/swagger/OpenApiNormalizer';
import { createNormalizedSpec } from '../../domain/models/NormalizedSpec';
import { createOperation } from '../../domain/models/Operation';

/**
 * normalizeSpec.usecase
 * Convert a parsed OpenAPI object into the domain `NormalizedSpec`.
 */
export function normalizeSpec(parsedSpec: any): import('../../domain/models/NormalizedSpec').NormalizedSpec {
  const normalized = OpenApiNormalizer.normalize(parsedSpec);

  const ops = (normalized.operations ?? []).map((op: any) =>
    createOperation({ operationId: op.operationId, method: op.method as any, path: op.path, tags: op.tags ?? [], summary: op.summary }),
  );

  const servers = (normalized.servers ?? []).map((s: any) => (typeof s === 'string' ? { url: s } : s));

  const domain = createNormalizedSpec({
    id: normalized.id || `spec-${Date.now()}`,
    title: normalized.title ?? 'untitled',
    version: normalized.version ?? 'unknown',
    servers,
    operations: ops,
    raw: normalized.raw,
  });

  return domain;
}

export default normalizeSpec;
