import { RunPlanRepository } from '../../domain/repositories/RunPlanRepository';
import type { RunPlan } from '../../domain/models/RunPlan';

export class InMemoryRunPlanRepository implements RunPlanRepository {
  private store: Map<string, RunPlan> = new Map();

  async save(plan: RunPlan): Promise<void> {
    this.store.set(plan.runId, plan);
  }

  async getById(runId: string): Promise<RunPlan | undefined> {
    return this.store.get(runId);
  }

  async list(): Promise<RunPlan[]> {
    return Array.from(this.store.values());
  }

  async update(plan: RunPlan): Promise<void> {
    this.store.set(plan.runId, plan);
  }

  async delete(runId: string): Promise<void> {
    this.store.delete(runId);
  }
}

export default InMemoryRunPlanRepository;
