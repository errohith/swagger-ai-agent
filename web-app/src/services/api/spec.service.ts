import { apiClient } from './client';

export interface Spec {
  id: string;
  title: string;
  version: string;
  description?: string;
  format: 'yaml' | 'json';
  createdAt: string;
  updatedAt: string;
}

export interface SpecOperation {
  operationId: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

export interface IngestSpecRequest {
  specContent: string;
  format: 'yaml' | 'json';
}

export interface ValidateSpecRequest {
  specContent: string;
  format: 'yaml' | 'json';
}

export const specService = {
  // Import/Ingest Swagger spec
  ingestSpec: async (data: IngestSpecRequest): Promise<Spec> => {
    const response = await apiClient.post('/spec/import', data);
    return response.data;
  },

  // Validate Swagger spec
  validateSpec: async (data: ValidateSpecRequest): Promise<{ valid: boolean; errors?: string[] }> => {
    const response = await apiClient.post('/spec/validate', data);
    return response.data;
  },

  // List all specs
  listSpecs: async (): Promise<Spec[]> => {
    const response = await apiClient.get('/spec');
    return response.data;
  },

  // Get spec by ID
  getSpec: async (specId: string): Promise<Spec> => {
    const response = await apiClient.get(`/spec/${specId}`);
    return response.data;
  },

  // Get spec operations
  getOperations: async (specId: string): Promise<SpecOperation[]> => {
    const response = await apiClient.get(`/spec/${specId}/operations`);
    return response.data;
  },

  // Delete spec
  deleteSpec: async (specId: string): Promise<void> => {
    await apiClient.delete(`/spec/${specId}`);
  },
};
