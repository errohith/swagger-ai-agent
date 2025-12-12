import InMemorySpecRepository from '../../../../infrastructure/persistence/InMemorySpecRepository';

export async function listOperationsTool(specId: string) {
  const repo = new InMemorySpecRepository();
  const spec = await repo.getById(specId);
  if (!spec) throw new Error(`spec not found: ${specId}`);

  return (spec.operations || []).map((op: any) => ({ operationId: op.operationId, method: op.method, path: op.path, tags: op.tags ?? [], summary: op.summary }));
}

export default listOperationsTool;
