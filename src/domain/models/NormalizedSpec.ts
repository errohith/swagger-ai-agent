import type { Operation } from './Operation';

export interface ServerObject {
  url: string;
  description?: string;
  variables?: Record<string, unknown>;
}

export interface NormalizedSpec {
  id: string;
  title: string;
  version: string;
  description?: string;
  servers: ServerObject[];
  tags?: string[];
  operationCount: number;
  operations: Operation[];
  // raw original spec (optional) — kept for debugging or re-processing
  raw?: unknown;
}

/**
 * Create a minimal NormalizedSpec object.
 * The function avoids any external dependencies and performs simple normalization.
 */
export function createNormalizedSpec(input: Partial<NormalizedSpec> & { id: string; title: string; version: string; operations?: Operation[] }): NormalizedSpec {
  const operations = input.operations ?? [];
  const servers = input.servers ?? [];

  const spec: NormalizedSpec = {
    id: input.id,
    title: input.title,
    version: input.version,
    description: input.description,
    servers,
    tags: input.tags ?? [],
    operationCount: operations.length,
    operations,
    raw: input.raw,
  };

  return spec;
}

export default NormalizedSpec;
