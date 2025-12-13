import { apiClient } from './client';

export interface GenerateTestsRequest {
  specId: string;
  operationIds?: string[];
  testFramework?: 'jest' | 'mocha';
  includeAuth?: boolean;
}

export interface GenerateTestsResponse {
  testCode: string;
  fileName: string;
  operationCount: number;
}

export const testGenService = {
  // Generate Axios tests
  generateTests: async (data: GenerateTestsRequest): Promise<GenerateTestsResponse> => {
    const response = await apiClient.post('/testgen/generate', data);
    return response.data;
  },

  // Preview test generation
  previewTests: async (data: GenerateTestsRequest): Promise<{ preview: string }> => {
    const response = await apiClient.post('/testgen/preview', data);
    return response.data;
  },
};
