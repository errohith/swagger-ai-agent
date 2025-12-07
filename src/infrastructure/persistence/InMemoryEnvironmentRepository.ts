import { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import type { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export class InMemoryEnvironmentRepository implements EnvironmentRepository {
  private store: Map<string, EnvironmentConfig> = new Map();

  async create(env: EnvironmentConfig): Promise<void> {
    this.store.set(env.id, env);
  }

  async getById(id: string): Promise<EnvironmentConfig | undefined> {
    return this.store.get(id);
  }

  async listBySpecId(specId: string): Promise<EnvironmentConfig[]> {
    return Array.from(this.store.values()).filter((e) => e.specId === specId && !e.deleted);
  }

  async update(env: EnvironmentConfig): Promise<void> {
    this.store.set(env.id, env);
  }

  async delete(id: string): Promise<void> {
    const e = this.store.get(id);
    if (e) {
      e.deleted = true;
      this.store.set(id, e);
    }
  }
}

export default InMemoryEnvironmentRepository;
