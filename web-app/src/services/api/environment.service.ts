import { apiClient } from './client';

export interface Environment {
  id: string;
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnvironmentRequest {
  specId: string;
  name: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

export const environmentService = {
  // Create environment
  createEnvironment: async (data: CreateEnvironmentRequest): Promise<Environment> => {
    const response = await apiClient.post('/environment', data);
    return response.data;
  },

  // List environments for a spec
  listEnvironments: async (specId: string): Promise<Environment[]> => {
    const response = await apiClient.get(`/environment/spec/${specId}`);
    return response.data;
  },

  // Get environment by ID
  getEnvironment: async (envId: string): Promise<Environment> => {
    const response = await apiClient.get(`/environment/${envId}`);
    return response.data;
  },

  // Update environment
  updateEnvironment: async (envId: string, data: UpdateEnvironmentRequest): Promise<Environment> => {
    const response = await apiClient.put(`/environment/${envId}`, data);
    return response.data;
  },

  // Delete environment
  deleteEnvironment: async (envId: string): Promise<void> => {
    await apiClient.delete(`/environment/${envId}`);
  },
};
