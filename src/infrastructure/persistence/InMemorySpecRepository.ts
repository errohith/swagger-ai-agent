import { SpecRepository } from '../../domain/repositories/SpecRepository';
import type { NormalizedSpec } from '../../domain/models/NormalizedSpec';

export class InMemorySpecRepository implements SpecRepository {
  private store: Map<string, NormalizedSpec> = new Map();

  async save(spec: NormalizedSpec): Promise<void> {
    this.store.set(spec.id, spec);
  }

  async getById(id: string): Promise<NormalizedSpec | undefined> {
    return this.store.get(id);
  }

  async list(): Promise<NormalizedSpec[]> {
    return Array.from(this.store.values());
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}

export default InMemorySpecRepository;
