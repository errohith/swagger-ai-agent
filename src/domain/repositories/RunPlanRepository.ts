import type { RunPlan } from '../models/RunPlan';

export interface RunPlanRepository {
  save(plan: RunPlan): Promise<void>;
  getById(runId: string): Promise<RunPlan | undefined>;
  list(): Promise<RunPlan[]>;
  update(plan: RunPlan): Promise<void>;
  delete(runId: string): Promise<void>;
}

export default RunPlanRepository;
