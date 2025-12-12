import InMemorySpecRepository from '../../../../infrastructure/persistence/InMemorySpecRepository';
import InMemoryEnvironmentRepository from '../../../../infrastructure/persistence/InMemoryEnvironmentRepository';
import AxiosExecutionAdapter from '../../../../infrastructure/http/AxiosExecutionAdapter';

export async function executeOperationTool(specId: string, envName: string, operationId: string, overrides?: any) {
  const specRepo = new InMemorySpecRepository();
  const envRepo = new InMemoryEnvironmentRepository();

  const spec = await specRepo.getById(specId);
  if (!spec) throw new Error(`spec not found: ${specId}`);

  const envs = await envRepo.listBySpecId(specId);
  const env = envs.find((e) => e.name === envName);
  if (!env) throw new Error(`environment not found: ${envName}`);

  const op = (spec.operations || []).find((o: any) => o.operationId === operationId);
  if (!op) throw new Error(`operation not found: ${operationId}`);

  const res = await AxiosExecutionAdapter.executeOperation(op, env, overrides);
  return res;
}

export default executeOperationTool;
