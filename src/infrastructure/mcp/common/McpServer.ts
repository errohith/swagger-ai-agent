import McpToolRegistry, { McpTool } from './McpToolRegistry';

/**
 * McpServer
 * Minimal Phase 3 skeleton for an MCP server that delegates tool invocations
 * to a `McpToolRegistry`. This is intentionally small: later phases will add
 * transport/protocol integration and authentication.
 */
export class McpServer {
  private registry: McpToolRegistry;

  constructor(registry?: McpToolRegistry) {
    this.registry = registry ?? new McpToolRegistry();
  }

  registerTool(tool: McpTool): void {
    this.registry.register(tool);
  }

  listTools(): McpTool[] {
    return this.registry.list();
  }

  async invoke(toolId: string, payload: any): Promise<any> {
    const tool = this.registry.get(toolId);
    if (!tool) throw new Error(`McpServer.invoke: tool not found: ${toolId}`);
    return await Promise.resolve(tool.handler(payload));
  }
}

export default McpServer;
// Phase 3: simple registry-backed MCP server implemented above.
