import type { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import type { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';
import { createEnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export interface UpdateEnvironmentInput {
  id: string;
  specId: string;
  name?: string;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  authConfig?: EnvironmentConfig['authConfig'];
  isDefault?: boolean;
}

export class UpdateEnvironmentUseCase {
  private envRepo: EnvironmentRepository;

  constructor(envRepo: EnvironmentRepository) {
    this.envRepo = envRepo;
  }

  async execute(input: UpdateEnvironmentInput): Promise<EnvironmentConfig | undefined> {
    const existing = await this.envRepo.getById(input.id);
    if (!existing) return undefined;
    const updated: EnvironmentConfig = createEnvironmentConfig({
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    });
    await this.envRepo.update(updated);
    return updated;
  }
}
