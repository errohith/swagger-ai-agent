export type PayloadSource = 'schema' | 'example' | 'llm' | 'manual';

export interface PayloadTemplate {
  id: string;
  operationId?: string;
  source: PayloadSource;
  content: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export function createPayloadTemplate(input: Partial<PayloadTemplate> & { id: string; source: PayloadSource; content: unknown }): PayloadTemplate {
  const now = new Date().toISOString();
  return {
    id: input.id,
    operationId: input.operationId,
    source: input.source,
    content: input.content,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
}

export default PayloadTemplate;
