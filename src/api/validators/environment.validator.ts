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

export function validateUpdateEnvironmentBody(body: any) {
  if (!body || typeof body !== 'object') throw new ValidationError('Request body must be an object');
  if (!body.specId || typeof body.specId !== 'string') throw new ValidationError('specId is required and must be a string', { field: 'specId' });
  if (body.name && typeof body.name !== 'string') throw new ValidationError('name must be a string', { field: 'name' });
  if (body.baseUrl && typeof body.baseUrl !== 'string') throw new ValidationError('baseUrl must be a string', { field: 'baseUrl' });
  if (body.defaultHeaders && typeof body.defaultHeaders !== 'object') throw new ValidationError('defaultHeaders must be an object', { field: 'defaultHeaders' });
  return body as UpdateEnvironmentBody;
}
