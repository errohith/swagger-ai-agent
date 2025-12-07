import type { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export type CreateEnvironmentBody = {
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  authConfig?: EnvironmentConfig['authConfig'];
  isDefault?: boolean;
};

export function validateCreateEnvironmentBody(body: any): CreateEnvironmentBody {
  if (!body || typeof body !== 'object') throw new Error('Request body must be an object');
  if (!body.specId || typeof body.specId !== 'string') throw new Error('specId is required');
  if (!body.name || typeof body.name !== 'string') throw new Error('name is required');
  if (!body.baseUrl || typeof body.baseUrl !== 'string') throw new Error('baseUrl is required');
  if (body.defaultHeaders && typeof body.defaultHeaders !== 'object') throw new Error('defaultHeaders must be an object');
  return body as CreateEnvironmentBody;
}

export type UpdateEnvironmentBody = Partial<Omit<CreateEnvironmentBody, 'specId'>> & { specId: string };

export function validateUpdateEnvironmentBody(body: any): UpdateEnvironmentBody {
  if (!body || typeof body !== 'object') throw new Error('Request body must be an object');
  if (!body.specId || typeof body.specId !== 'string') throw new Error('specId is required');
  if (body.name && typeof body.name !== 'string') throw new Error('name must be a string');
  if (body.baseUrl && typeof body.baseUrl !== 'string') throw new Error('baseUrl must be a string');
  if (body.defaultHeaders && typeof body.defaultHeaders !== 'object') throw new Error('defaultHeaders must be an object');
  return body as UpdateEnvironmentBody;
}
