export type McpToolHandler = (payload: any) => Promise<any> | any;

export type McpTool = {
  id: string;
  name: string;
  description?: string;
  handler: McpToolHandler;
};

/**
 * McpToolRegistry
 * Simple in-memory registry for MCP tools. Phase 3 skeleton — stores tool
 * metadata and handlers. No external dependencies.
 */
export class McpToolRegistry {
  private tools: Map<string, McpTool> = new Map();

  register(tool: McpTool): void {
    if (!tool || !tool.id) throw new Error('McpToolRegistry.register: tool must have an id');
    this.tools.set(tool.id, tool);
  }

  get(toolId: string): McpTool | undefined {
    return this.tools.get(toolId);
  }

  list(): McpTool[] {
    return Array.from(this.tools.values());
  }

  has(toolId: string): boolean {
    return this.tools.has(toolId);
  }
}

export default McpToolRegistry;
// Phase 3: registry-backed implementation above is the intended implementation.
