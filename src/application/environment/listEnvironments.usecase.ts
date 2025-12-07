import type { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import type { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';

export interface ListEnvironmentsInput {
  specId: string;
}

export class ListEnvironmentsUseCase {
  private envRepo: EnvironmentRepository;

  constructor(envRepo: EnvironmentRepository) {
    this.envRepo = envRepo;
  }

  async execute(input: ListEnvironmentsInput): Promise<EnvironmentConfig[]> {
    return this.envRepo.listBySpecId(input.specId);
  }
}
