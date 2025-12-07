import type { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';

export interface DeleteEnvironmentInput {
  id: string;
}

export class DeleteEnvironmentUseCase {
  private envRepo: EnvironmentRepository;

  constructor(envRepo: EnvironmentRepository) {
    this.envRepo = envRepo;
  }

  async execute(input: DeleteEnvironmentInput): Promise<void> {
    await this.envRepo.delete(input.id);
  }
}
