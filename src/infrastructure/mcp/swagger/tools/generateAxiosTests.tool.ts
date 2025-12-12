import InMemorySpecRepository from '../../../../infrastructure/persistence/InMemorySpecRepository';
import { generateAxiosTestsFromSpec } from '../../../../application/testgen/generateAxiosTests.usecase';

export async function generateAxiosTestsTool(specId: string, selection?: any, options?: any) {
  const repo = new InMemorySpecRepository();
  const result = await generateAxiosTestsFromSpec(specId, repo as any, selection, options);
  return result;
}

export default generateAxiosTestsTool;
