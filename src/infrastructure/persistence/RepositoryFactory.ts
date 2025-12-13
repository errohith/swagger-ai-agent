/**
 * Repository Factory - Singleton pattern for shared in-memory repositories
 * Ensures all controllers use the same repository instances
 */

import InMemorySpecRepository from './InMemorySpecRepository';
import InMemoryEnvironmentRepository from './InMemoryEnvironmentRepository';
import InMemoryRunPlanRepository from './InMemoryRunPlanRepository';

class RepositoryFactory {
  private static specRepo: InMemorySpecRepository;
  private static envRepo: InMemoryEnvironmentRepository;
  private static runPlanRepo: InMemoryRunPlanRepository;

  static getSpecRepository(): InMemorySpecRepository {
    if (!this.specRepo) {
      this.specRepo = new InMemorySpecRepository();
    }
    return this.specRepo;
  }

  static getEnvironmentRepository(): InMemoryEnvironmentRepository {
    if (!this.envRepo) {
      this.envRepo = new InMemoryEnvironmentRepository();
    }
    return this.envRepo;
  }

  static getRunPlanRepository(): InMemoryRunPlanRepository {
    if (!this.runPlanRepo) {
      this.runPlanRepo = new InMemoryRunPlanRepository();
    }
    return this.runPlanRepo;
  }
}

export default RepositoryFactory;
