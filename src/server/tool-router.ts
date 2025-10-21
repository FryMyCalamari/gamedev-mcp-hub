/**
 * Tool Router - Routes tool calls to appropriate MCP servers
 */

import type { ToolResult } from '../types/hub-types.js';
import { ConnectionManager } from './connection-manager.js';
import { Logger } from '../utils/logger.js';
import { ToolExecutionError } from '../utils/error-handler.js';

const logger = Logger.getInstance();

export class ToolRouter {
  constructor(private connectionManager: ConnectionManager) {}

  /**
   * Route a tool call to the appropriate server
   */
  public async routeToolCall(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<ToolResult & { tokens?: number }> {
    // Extract server name from tool name (format: server__toolname)
    const parts = toolName.split('__');
    if (parts.length < 2) {
      throw new ToolExecutionError(toolName, 'Invalid tool name format. Expected: server__toolname');
    }

    const serverName = parts[0];
    const actualToolName = parts.slice(1).join('__');

    // Get server connection
    const connection = this.connectionManager.getServer(serverName);
    if (!connection) {
      throw new ToolExecutionError(toolName, `Server not found: ${serverName}`);
    }

    if (connection.status !== 'connected') {
      throw new ToolExecutionError(
        toolName,
        `Server ${serverName} is not connected (status: ${connection.status})`
      );
    }

    if (connection.circuitBreakerOpen) {
      throw new ToolExecutionError(toolName, `Circuit breaker open for server: ${serverName}`);
    }

    try {
      logger.debug(`Routing tool call ${toolName} to server ${serverName}`);

      // In a real implementation, this would send the tool call to the MCP server
      // For now, return a stub response
      const result = await this.executeToolOnServer(serverName, actualToolName, args);

      return result;
    } catch (error) {
      logger.error(`Tool execution failed for ${toolName}:`, error);
      throw new ToolExecutionError(toolName, error);
    }
  }

  /**
   * Execute a tool on a specific server (stub implementation)
   */
  private async executeToolOnServer(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<ToolResult & { tokens?: number }> {
    // This is a stub implementation
    // In a real implementation, this would:
    // 1. Serialize the tool call request
    // 2. Send it to the MCP server via stdio
    // 3. Wait for and deserialize the response
    // 4. Return the result

    logger.debug(`Executing tool ${toolName} on server ${serverName} with args:`, args);

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      content: [
        {
          type: 'text',
          text: `Tool ${toolName} executed successfully on ${serverName} (stub implementation)`,
        },
      ],
      tokens: 50, // Stub token count
    };
  }

  /**
   * Broadcast a tool call to multiple servers (for future use)
   */
  public async broadcast(
    servers: string[],
    toolName: string,
    args: Record<string, unknown>
  ): Promise<Map<string, ToolResult>> {
    const results = new Map<string, ToolResult>();

    const promises = servers.map(async (serverName) => {
      try {
        const fullToolName = `${serverName}__${toolName}`;
        const result = await this.routeToolCall(fullToolName, args);
        results.set(serverName, result);
      } catch (error) {
        logger.error(`Broadcast to ${serverName} failed:`, error);
      }
    });

    await Promise.allSettled(promises);

    return results;
  }
}
