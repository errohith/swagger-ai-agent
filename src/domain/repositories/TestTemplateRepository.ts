import type { PayloadTemplate } from '../models/PayloadTemplate';

export interface TestTemplateRepository {
  save(template: PayloadTemplate): Promise<void>;
  getById(id: string): Promise<PayloadTemplate | undefined>;
  listByOperation(operationId: string): Promise<PayloadTemplate[]>;
  delete(id: string): Promise<void>;
}

export default TestTemplateRepository;
