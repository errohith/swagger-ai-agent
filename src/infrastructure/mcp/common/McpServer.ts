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
/**
 * McpServer skeleton
 *
 * A minimal class to represent an MCP server adapter. In Phase 3 this is a
 * placeholder that will be extended to register tools and expose a programmatic
 * API for MCP tooling.
 */

export class McpServer {
  private tools: Map<string, Function> = new Map();

  registerTool(name: string, fn: Function): void {
    this.tools.set(name, fn);
  }

  async invokeTool(name: string, payload: unknown): Promise<unknown> {
    const fn = this.tools.get(name);
    if (!fn) throw new Error(`Tool not found: ${name}`);
    return await Promise.resolve(fn(payload));
  }
}

export default McpServer;
