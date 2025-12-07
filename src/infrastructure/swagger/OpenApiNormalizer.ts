/**
 * OpenApiNormalizer
 * Phase 3 skeleton that creates a minimal, normalized representation
 * of an OpenAPI / Swagger spec suitable for use by application use-cases.
 *
 * This implementation is intentionally lightweight: it extracts top-level
 * metadata and flattens `paths` into a simple operation list. In later phases
 * this will be replaced with a full NormalizedSpec -> domain model mapper.
 */
export type NormalizedOperation = {
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  tags: string[];
};

export type NormalizedSpec = {
  id?: string;
  title?: string;
  version?: string;
  servers?: string[];
  operations: NormalizedOperation[];
  raw?: any;
};

import { createNormalizedSpec } from '../../domain/models/NormalizedSpec';
import { createOperation } from '../../domain/models/Operation';

/**
 * OpenApiNormalizer
 *
 * Convert a parsed OpenAPI/Swagger object into the project's `NormalizedSpec`
 * domain model. This implementation is intentionally small and defensive so it
 * works with minimal parser output. It will be extended in later micro-tasks
 * to provide robust normalization for OpenAPI v2 and v3.
 */

export class OpenApiNormalizer {
  static normalize(parsedSpec: any, specId?: string): import('../../domain/models/NormalizedSpec').NormalizedSpec {
    const info = parsedSpec?.info ?? {};
    const title = info.title || 'untitled';
    const version = info.version || parsedSpec?.openapi || parsedSpec?.swagger || '0.0.0';

    const serversRaw = parsedSpec.servers ?? (parsedSpec.host ? [{ url: parsedSpec.host }] : []);
    const servers = Array.isArray(serversRaw) ? serversRaw.map((s: any) => ({ url: s.url || s })) : [];

    const operations: any[] = [];
    const paths = parsedSpec.paths ?? {};
    for (const pathKey of Object.keys(paths)) {
      const methods = paths[pathKey] ?? {};
      for (const methodKey of Object.keys(methods)) {
        const op = methods[methodKey];
        const operationId = op.operationId || `${methodKey.toUpperCase()}_${pathKey}`;
        const operation = createOperation({
          operationId,
          method: methodKey.toUpperCase() as any,
          path: pathKey,
          tags: op.tags ?? [],
          summary: op.summary || op.description,
          parameters: op.parameters ?? [],
          requestBody: op.requestBody || undefined,
          responses: op.responses ? Object.keys(op.responses).map((status) => ({ statusCode: status, description: op.responses[status].description })) : [],
          security: op.security ?? [],
        } as any);
        operations.push(operation);
      }
    }

    const normalized = createNormalizedSpec({
      id: specId ?? (info.title ? `${info.title}-${Date.now()}` : `spec-${Date.now()}`),
      title,
      version,
      servers,
      operations,
      raw: parsedSpec,
    });

    return normalized;
  }
}

export default OpenApiNormalizer;
