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

export class OpenApiNormalizer {
  static normalize(parsedSpec: any): NormalizedSpec {
    const spec: NormalizedSpec = {
      id: parsedSpec?.info?.title ? `${parsedSpec.info.title}-${Date.now()}` : `spec-${Date.now()}`,
      title: parsedSpec?.info?.title ?? 'untitled',
      version: parsedSpec?.info?.version ?? parsedSpec?.openapi ?? parsedSpec?.swagger ?? 'unknown',
      servers: [],
      operations: [],
      raw: parsedSpec,
    };

    // servers (OpenAPI v3)
    if (Array.isArray(parsedSpec?.servers)) {
      spec.servers = parsedSpec.servers.map((s: any) => s.url).filter(Boolean);
    } else if (parsedSpec?.host) {
      // OpenAPI v2 / Swagger
      const scheme = (parsedSpec.schemes && parsedSpec.schemes[0]) || 'https';
      const host = parsedSpec.host || '';
      const basePath = parsedSpec.basePath || '';
      spec.servers = [`${scheme}://${host}${basePath}`];
    }

    // Flatten paths -> operations
    const paths = parsedSpec?.paths ?? {};
    for (const [path, methods] of Object.entries(paths)) {
      if (!methods || typeof methods !== 'object') continue;
      for (const [methodRaw, op] of Object.entries(methods as Record<string, any>)) {
        const method = methodRaw.toUpperCase();
        const operationId = op?.operationId || `${method}_${path}`.replace(/[\/{}]/g, '_');
        const summary = op?.summary ?? op?.description ?? '';
        const tags = Array.isArray(op?.tags) ? op.tags : [];
        spec.operations.push({ operationId, method, path, summary, tags });
      }
    }

    return spec;
  }
}

export default OpenApiNormalizer;
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
  normalize(parsedSpec: any, specId: string): import('../../domain/models/NormalizedSpec').NormalizedSpec {
    const info = parsedSpec?.info ?? {};
    const title = info.title || 'untitled';
    const version = info.version || '0.0.0';

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
          method: methodKey.toUpperCase(),
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
      id: specId,
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
