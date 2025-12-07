import type { NormalizedSpec } from '../models/NormalizedSpec';

export interface SpecRepository {
  save(spec: NormalizedSpec): Promise<void>;
  getById(id: string): Promise<NormalizedSpec | undefined>;
  list(): Promise<NormalizedSpec[]>;
  delete(id: string): Promise<void>;
}

export default SpecRepository;
