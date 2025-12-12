import type { SpecRepository } from '../../domain/repositories/SpecRepository';
import type { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import type { TestCaseDefinition, createTestCaseDefinition } from '../../domain/models/TestCaseDefinition';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError } from '../../core/errors/AppError';

export interface GenerateOptions {
  includeNegativeTests?: boolean;
  includeAuthTests?: boolean;
  includeBoundaryTests?: boolean;
}

export interface GenerateResult {
  code: string;
  tests: TestCaseDefinition[];
}

export async function generateAxiosTestsFromSpec(specId: string, specRepo: SpecRepository, selection?: { mode?: 'tag' | 'full' | 'operation'; tags?: string[]; operationIds?: string[] }, options?: GenerateOptions): Promise<GenerateResult> {
  const spec = await specRepo.getById(specId) as NormalizedSpec | undefined;
  if (!spec) throw new NotFoundError(`Spec not found with ID: ${specId}`, { specId });

  // Select operations
  let ops = spec.operations ?? [];
  if (selection?.mode === 'tag' && selection.tags && selection.tags.length > 0) {
    ops = ops.filter((o) => (o.tags ?? []).some((t) => selection.tags!.includes(t)));
  } else if (selection?.mode === 'operation' && selection.operationIds) {
    ops = ops.filter((o) => selection.operationIds!.includes(o.operationId));
  }

  const tests: TestCaseDefinition[] = [];
  for (const op of ops) {
    // happy path
    tests.push({
      id: uuidv4(),
      operationId: op.operationId,
      name: `${op.operationId} - happy path`,
      type: 'happy',
      expectedStatus: 200,
      payloadStrategy: op.requestBody ? 'example' : 'none',
      overrides: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as TestCaseDefinition);

    if (options?.includeNegativeTests) {
      tests.push({
        id: uuidv4(),
        operationId: op.operationId,
        name: `${op.operationId} - negative`,
        type: 'negative',
        expectedStatus: 400,
        payloadStrategy: 'schema',
        overrides: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as TestCaseDefinition);
    }
  }

  const code = renderJestAxiosTestFile(spec, tests);

  return { code, tests };
}

function renderJestAxiosTestFile(spec: NormalizedSpec, tests: TestCaseDefinition[]): string {
  const lines: string[] = [];
  lines.push("const axios = require('axios');");
  lines.push('');
  lines.push(`const baseUrl = '${(spec.servers && spec.servers[0]?.url) ?? ''}';`);
  lines.push('');
  lines.push("describe('Generated Axios tests', () => {");

  for (const t of tests) {
    const op = (spec.operations || []).find((o) => o.operationId === t.operationId);
    if (!op) continue;
    const method = op.method.toLowerCase();
    const path = op.path;
    lines.push(`  it('${escapeForJs(t.name)}', async () => {`);
    lines.push(`    const resp = await axios.request({ method: '${method}', url: baseUrl + '${path}', validateStatus: () => true });`);
    lines.push(`    expect(resp.status).toBe(${t.expectedStatus});`);
    lines.push('  });');
    lines.push('');
  }

  lines.push('});');

  return lines.join('\n');
}

function escapeForJs(s: string): string {
  return s.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

export default generateAxiosTestsFromSpec;
