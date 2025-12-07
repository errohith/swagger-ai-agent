export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  schema?: unknown;
  description?: string;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: unknown; example?: unknown }>;
}

export interface ResponseDescriptor {
  statusCode: number | string;
  description?: string;
  content?: Record<string, { schema?: unknown; example?: unknown }>;
}

export interface SecurityRequirement {
  name: string;
  scopes?: string[];
}

export interface Operation {
  operationId: string;
  method: HttpMethod;
  path: string;
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: ResponseDescriptor[];
  security?: SecurityRequirement[];
}

export function createOperation(input: Partial<Operation> & { operationId: string; method: HttpMethod; path: string }): Operation {
  return {
    operationId: input.operationId,
    method: input.method,
    path: input.path,
    tags: input.tags ?? [],
    summary: input.summary,
    description: input.description,
    parameters: input.parameters ?? [],
    requestBody: input.requestBody,
    responses: input.responses ?? [],
    security: input.security ?? [],
  };
}

export default Operation;
