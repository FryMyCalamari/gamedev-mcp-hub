/**
 * Connection Manager - Manages connections to downstream MCP servers
 */

import { spawn, ChildProcess } from 'child_process';
import type { ServersConfig, ServerConnection, Tool, ServerConfig } from '../types/hub-types.js';
import { Logger } from '../utils/logger.js';
import { ServerConnectionError } from '../utils/error-handler.js';

const logger = Logger.getInstance();

export class ConnectionManager {
  private connections: Map<string, ServerConnection> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  /**
   * Connect to all enabled servers in the configuration
   */
  public async connectServers(config: ServersConfig): Promise<void> {
    logger.info('Connecting to downstream MCP servers...');

    const connectionPromises = Object.entries(config.servers)
      .filter(([_, serverConfig]) => serverConfig.enabled)
      .map(([name, serverConfig]) => this.connectServer(name, serverConfig));

    const results = await Promise.allSettled(connectionPromises);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info(`Connected to ${successful} servers, ${failed} failed`);
  }

  /**
   * Connect to a single server
   */
  private async connectServer(name: string, config: ServerConfig): Promise<void> {
    try {
      logger.info(`Connecting to server: ${name}`);

      // Spawn the server process
      const process = spawn(config.command, config.args, {
        env: { ...process.env, ...config.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.processes.set(name, process);

      // Create connection object
      const connection: ServerConnection = {
        name,
        config,
        status: 'connecting',
        tools: [],
        failureCount: 0,
        circuitBreakerOpen: false,
      };

      this.connections.set(name, connection);

      // Set up error handling
      process.on('error', (error) => {
        logger.error(`Server ${name} process error:`, error);
        this.handleServerError(name);
      });

      process.on('exit', (code) => {
        logger.warn(`Server ${name} process exited with code ${code}`);
        this.handleServerDisconnect(name);
      });

      // Wait for server to be ready (simplified - would need actual health check)
      await this.waitForServerReady(name);

      // Fetch available tools
      const tools = await this.fetchServerTools(name);
      connection.tools = tools;
      connection.status = 'connected';

      logger.info(`Successfully connected to ${name} with ${tools.length} tools`);
    } catch (error) {
      logger.error(`Failed to connect to server ${name}:`, error);
      throw new ServerConnectionError(name, error);
    }
  }

  /**
   * Wait for server to be ready (stub implementation)
   */
  private async waitForServerReady(name: string): Promise<void> {
    // In a real implementation, this would check for server readiness
    // For now, just wait a bit
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  /**
   * Fetch tools from a server (stub implementation)
   */
  private async fetchServerTools(name: string): Promise<Tool[]> {
    // In a real implementation, this would query the MCP server for its tools
    // For now, return empty array
    logger.debug(`Fetching tools from server: ${name}`);
    return [];
  }

  /**
   * Handle server error
   */
  private handleServerError(name: string): void {
    const connection = this.connections.get(name);
    if (connection) {
      connection.failureCount++;
      connection.status = 'error';

      if (connection.failureCount >= 3) {
        connection.circuitBreakerOpen = true;
        logger.error(`Circuit breaker opened for server: ${name}`);
      }

      if (connection.config.auto_reconnect) {
        setTimeout(() => {
          void this.reconnectServer(name);
        }, 5000);
      }
    }
  }

  /**
   * Handle server disconnect
   */
  private handleServerDisconnect(name: string): void {
    const connection = this.connections.get(name);
    if (connection) {
      connection.status = 'disconnected';

      if (connection.config.auto_reconnect) {
        setTimeout(() => {
          void this.reconnectServer(name);
        }, 5000);
      }
    }
  }

  /**
   * Reconnect to a server
   */
  private async reconnectServer(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (!connection) return;

    logger.info(`Attempting to reconnect to server: ${name}`);

    try {
      // Kill existing process if any
      const existingProcess = this.processes.get(name);
      if (existingProcess) {
        existingProcess.kill();
      }

      await this.connectServer(name, connection.config);
    } catch (error) {
      logger.error(`Failed to reconnect to server ${name}:`, error);
    }
  }

  /**
   * Get all tools from all connected servers
   */
  public async getAllTools(): Promise<Tool[]> {
    const allTools: Tool[] = [];

    for (const [serverName, connection] of this.connections) {
      if (connection.status === 'connected') {
        // Prefix tool names with server name
        const prefixedTools = connection.tools.map((tool) => ({
          ...tool,
          name: `${serverName}__${tool.name}`,
          server: serverName,
        }));
        allTools.push(...prefixedTools);
      }
    }

    return allTools;
  }

  /**
   * Get server by name
   */
  public getServer(name: string): ServerConnection | undefined {
    return this.connections.get(name);
  }

  /**
   * Get all server statuses
   */
  public getServerStatus(): Array<{ name: string; status: string; toolCount: number }> {
    return Array.from(this.connections.values()).map((conn) => ({
      name: conn.name,
      status: conn.status,
      toolCount: conn.tools.length,
    }));
  }

  /**
   * Get count of connected servers
   */
  public getConnectedCount(): number {
    return Array.from(this.connections.values()).filter((conn) => conn.status === 'connected')
      .length;
  }

  /**
   * Perform health check on all servers
   */
  public async healthCheck(): Promise<void> {
    for (const [name, connection] of this.connections) {
      if (connection.status === 'connected') {
        try {
          // In a real implementation, this would ping the server
          connection.lastHealthCheck = new Date();
        } catch (error) {
          logger.warn(`Health check failed for server ${name}:`, error);
          this.handleServerError(name);
        }
      }
    }
  }

  /**
   * Disconnect all servers
   */
  public async disconnectAll(): Promise<void> {
    logger.info('Disconnecting all servers...');

    for (const [name, process] of this.processes) {
      try {
        process.kill();
        logger.info(`Disconnected from server: ${name}`);
      } catch (error) {
        logger.error(`Error disconnecting from server ${name}:`, error);
      }
    }

    this.connections.clear();
    this.processes.clear();
  }
}
