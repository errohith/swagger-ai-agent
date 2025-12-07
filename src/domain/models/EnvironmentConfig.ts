export interface AuthConfig {
  type?: 'basic' | 'bearer' | 'apikey' | 'oauth2' | string;
  credentials?: Record<string, unknown>;
}

export interface EnvironmentConfig {
  id: string;
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  authConfig?: AuthConfig;
  isDefault?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function createEnvironmentConfig(input: Partial<EnvironmentConfig> & { id: string; specId: string; name: string; baseUrl: string }): EnvironmentConfig {
  return {
    id: input.id,
    specId: input.specId,
    name: input.name,
    baseUrl: input.baseUrl,
    defaultHeaders: input.defaultHeaders ?? {},
    authConfig: input.authConfig,
    isDefault: !!input.isDefault,
    deleted: !!input.deleted,
    createdAt: input.createdAt ?? new Date().toISOString(),
    updatedAt: input.updatedAt ?? new Date().toISOString(),
  };
}

export default EnvironmentConfig;
