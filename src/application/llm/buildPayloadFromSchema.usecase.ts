import type { SpecRepository } from '../../domain/repositories/SpecRepository';
import type { NormalizedSpec } from '../../domain/models/NormalizedSpec';
import PayloadBuilderLlmClient, { type PayloadHints } from '../../infrastructure/llm/PayloadBuilderLlmClient';
import { NotFoundError } from '../../core/errors/AppError';

export interface BuildPayloadResult {
  operationId: string;
  examples: Array<{ payload: any; source: 'schema' | 'llm' | 'partial' }>; 
}

export interface BuildPayloadDeps {
  specRepo: SpecRepository;
  payloadBuilder?: PayloadBuilderLlmClient;
}

/**
 * Try to build example payload(s) for an operation using schema/examples first,
 * then call LLM enrichment for missing required fields only when necessary.
 */
export async function buildPayloadFromSchema(
  specId: string,
  operationId: string,
  deps: BuildPayloadDeps,
  hints?: PayloadHints
): Promise<BuildPayloadResult> {
  const { specRepo, payloadBuilder = new PayloadBuilderLlmClient() } = deps;

  const spec = await specRepo.getById(specId) as NormalizedSpec | undefined;
  if (!spec) throw new NotFoundError(`Spec not found with ID: ${specId}`, { specId });

  const op = (spec.operations || []).find((o) => o.operationId === operationId);
  if (!op) throw new NotFoundError(`Operation not found with ID: ${operationId}`, { specId, operationId });

  // Find JSON schema for requestBody if present
  const content = (op.requestBody && (op.requestBody as any).content) ?? undefined;
  const jsonDesc = content ? content['application/json'] ?? Object.values(content)[0] : undefined;
  const schema = jsonDesc ? (jsonDesc as any).schema ?? (jsonDesc as any) : undefined;

  const examples: Array<{ payload: any; source: 'schema' | 'llm' | 'partial' }> = [];

  if (!schema) {
    // Nothing to derive from schema — ask LLM to generate an example from operation context
    const fromLlm = await payloadBuilder.enrichWithLlm({ operationId, specTitle: spec.title }, hints);
    examples.push({ payload: fromLlm, source: 'llm' });
    return { operationId, examples };
  }

  // Build best-effort payload from schema
  const partial = await payloadBuilder.buildFromSchema(schema, hints);
  if (partial != null) {
    examples.push({ payload: partial, source: 'schema' });
  }

  // If schema has required fields, check for missing ones and call LLM only for those
  const required: string[] = Array.isArray((schema as any).required) ? (schema as any).required.slice() : [];
  const missingRequired: string[] = [];
  if (required.length > 0) {
    for (const r of required) {
      if (partial == null || Object.prototype.hasOwnProperty.call(partial, r) === false || partial[r] === null || partial[r] === undefined) {
        missingRequired.push(r);
      }
    }
  }

  if (missingRequired.length > 0) {
    // Ask LLM to fill only the missing fields, passing the partial payload
    const enriched = await payloadBuilder.enrichWithLlm(partial ?? {}, { ...(hints ?? {}), maxFields: missingRequired.length });
    examples.push({ payload: enriched, source: 'llm' });
  }

  // If no examples produced yet, return null payload via LLM fallback
  if (examples.length === 0) {
    const fallback = await payloadBuilder.enrichWithLlm({}, hints);
    examples.push({ payload: fallback, source: 'llm' });
  }

  return { operationId, examples };
}

export default buildPayloadFromSchema;
