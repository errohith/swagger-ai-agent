import type { EnvironmentRepository } from '../../domain/repositories/EnvironmentRepository';
import type { EnvironmentConfig } from '../../domain/models/EnvironmentConfig';
import { createEnvironmentConfig } from '../../domain/models/EnvironmentConfig';
import { v4 as uuidv4 } from 'uuid';

export interface CreateEnvironmentInput {
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  authConfig?: EnvironmentConfig['authConfig'];
  isDefault?: boolean;
}

export class CreateEnvironmentUseCase {
  private envRepo: EnvironmentRepository;

  constructor(envRepo: EnvironmentRepository) {
    this.envRepo = envRepo;
  }

  async execute(input: CreateEnvironmentInput): Promise<EnvironmentConfig> {
    const id = uuidv4();
    const env: EnvironmentConfig = createEnvironmentConfig({
      id,
      specId: input.specId,
      name: input.name,
      baseUrl: input.baseUrl,
      defaultHeaders: input.defaultHeaders,
      authConfig: input.authConfig,
      isDefault: input.isDefault,
    });
    await this.envRepo.create(env);
    return env;
  }
}
