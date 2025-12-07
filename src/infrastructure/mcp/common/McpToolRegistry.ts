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
export class McpToolRegistry {
  private registry: Map<string, { description?: string; handler: Function }> = new Map();

  register(name: string, handler: Function, description?: string): void {
    this.registry.set(name, { handler, description });
  }

  listTools(): Array<{ name: string; description?: string }> {
    return Array.from(this.registry.entries()).map(([name, v]) => ({ name, description: v.description }));
  }

  getHandler(name: string): Function | undefined {
    return this.registry.get(name)?.handler;
  }
}

export default McpToolRegistry;
