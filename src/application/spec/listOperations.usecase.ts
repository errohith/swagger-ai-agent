import type { SpecRepository } from '../../domain/repositories/SpecRepository';

export type OperationSummary = {
  operationId: string;
  method: string;
  path: string;
  tags: string[];
  summary?: string;
};

export async function listOperations(specId: string, repo: SpecRepository): Promise<OperationSummary[]> {
  const spec = await repo.getById(specId);
  if (!spec) throw new Error(`Spec not found: ${specId}`);

  return (spec.operations ?? []).map((op: any) => ({ operationId: op.operationId, method: op.method, path: op.path, tags: op.tags ?? [], summary: op.summary }));
}

export default listOperations;
