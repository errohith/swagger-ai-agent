import type { EnvironmentConfig } from '../models/EnvironmentConfig';

export interface EnvironmentRepository {
  create(env: EnvironmentConfig): Promise<void>;
  getById(id: string): Promise<EnvironmentConfig | undefined>;
  listBySpecId(specId: string): Promise<EnvironmentConfig[]>;
  update(env: EnvironmentConfig): Promise<void>;
  delete(id: string): Promise<void>;
}

export default EnvironmentRepository;
