import { apiClient } from './client';

export interface McpToolResult {
  success: boolean;
  data: any;
  error?: string;
}

export const mcpService = {
  // Swagger MCP Tools
  swagger: {
    // List operations via MCP
    listOperations: async (specId: string): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/swagger/list-operations', { specId });
      return response.data;
    },

    // Execute operation via MCP
    executeOperation: async (specId: string, operationId: string, params?: any): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/swagger/execute-operation', {
        specId,
        operationId,
        params,
      });
      return response.data;
    },

    // Plan API run via MCP
    planApiRun: async (specId: string, environmentId: string, operationIds?: string[]): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/swagger/plan-api-run', {
        specId,
        environmentId,
        operationIds,
      });
      return response.data;
    },

    // Generate tests via MCP
    generateTests: async (specId: string, operationIds?: string[]): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/swagger/generate-tests', {
        specId,
        operationIds,
      });
      return response.data;
    },
  },

  // Jest MCP Tools
  jest: {
    // Run Jest tests via MCP
    runTests: async (testPath: string, config?: any): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/jest/run-tests', {
        testPath,
        config,
      });
      return response.data;
    },

    // Parse Jest report via MCP
    parseReport: async (reportPath: string): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/jest/parse-report', {
        reportPath,
      });
      return response.data;
    },

    // Get test coverage via MCP
    getCoverage: async (testPath: string): Promise<McpToolResult> => {
      const response = await apiClient.post('/mcp/jest/coverage', {
        testPath,
      });
      return response.data;
    },
  },
};
