/**
 * Connection Manager - Manages connections to downstream MCP servers
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { ServersConfig, ServerConnection, Tool, ServerConfig } from '../types/hub-types.js';
import { Logger } from '../utils/logger.js';
import { ServerConnectionError } from '../utils/error-handler.js';

const logger = Logger.getInstance();

export class ConnectionManager {
  private connections: Map<string, ServerConnection> = new Map();
  private clients: Map<string, Client> = new Map();

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

      // Initialize MCP client (this will spawn the process)
      await this.initializeMCPClient(name, config);

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
   * Initialize MCP client with stdio transport
   * The transport will handle spawning and managing the server process
   */
  private async initializeMCPClient(name: string, config: ServerConfig): Promise<void> {
    // Create MCP client with stdio transport
    // StdioClientTransport will spawn the process internally
    // Merge environment variables, filtering out undefined values
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }
    if (config.env) {
      for (const [key, value] of Object.entries(config.env)) {
        env[key] = value;
      }
    }
    
    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env,
    });

    const client = new Client({
      name: `gamedev-mcp-hub-${name}`,
      version: '0.1.0',
    }, {
      capabilities: {},
    });

    // Connect and initialize
    await client.connect(transport);
    this.clients.set(name, client);

    logger.debug(`MCP client initialized for server: ${name}`);
  }

  /**
   * Fetch tools from a server using MCP protocol
   */
  private async fetchServerTools(name: string): Promise<Tool[]> {
    const client = this.clients.get(name);
    if (!client) {
      logger.warn(`No MCP client found for server: ${name}`);
      return [];
    }

    try {
      logger.debug(`Fetching tools from server: ${name}`);
      const response = await client.listTools();

      // Map MCP tool format to our Tool type
      const tools: Tool[] = response.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema || {},
        category: '', // Will be set by registry
        server: name,
      }));

      logger.debug(`Fetched ${tools.length} tools from server: ${name}`);
      return tools;
    } catch (error) {
      logger.error(`Failed to fetch tools from server ${name}:`, error);
      return [];
    }
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
   * Reconnect to a server
   */
  private async reconnectServer(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (!connection) return;

    logger.info(`Attempting to reconnect to server: ${name}`);

    try {
      // Close existing client if any
      const existingClient = this.clients.get(name);
      if (existingClient) {
        try {
          await existingClient.close();
        } catch (error) {
          logger.warn(`Error closing existing client during reconnect: ${error}`);
        }
        this.clients.delete(name);
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
   * Call a tool on a downstream server
   */
  public async callTool(serverName: string, toolName: string, args: Record<string, unknown>): Promise<any> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`No MCP client found for server: ${serverName}`);
    }

    try {
      logger.debug(`Calling tool ${toolName} on server ${serverName}`);
      const response = await client.callTool({
        name: toolName,
        arguments: args,
      });
      return response;
    } catch (error) {
      logger.error(`Failed to call tool ${toolName} on server ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Connect a specific server by name (for GUI manual control)
   */
  public async connectServerByName(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Server ${name} not found in configuration`);
    }

    if (connection.status === 'connected') {
      logger.warn(`Server ${name} is already connected`);
      return;
    }

    await this.connectServer(name, connection.config);
  }

  /**
   * Disconnect a specific server by name (for GUI manual control)
   */
  public async disconnectServerByName(name: string): Promise<void> {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Server ${name} not found`);
    }

    if (connection.status === 'disconnected') {
      logger.warn(`Server ${name} is already disconnected`);
      return;
    }

    // Close MCP client (this will also terminate the spawned process)
    const client = this.clients.get(name);
    if (client) {
      try {
        await client.close();
        this.clients.delete(name);
        logger.info(`Disconnected from server: ${name}`);
      } catch (error) {
        logger.error(`Error closing MCP client for server ${name}:`, error);
      }
    }

    connection.status = 'disconnected';
  }

  /**
   * Get tools from a specific server (for GUI)
   */
  public async getServerTools(name: string): Promise<Tool[]> {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Server ${name} not found`);
    }

    if (connection.status !== 'connected') {
      return [];
    }

    // Prefix tool names with server name
    return connection.tools.map((tool) => ({
      ...tool,
      name: `${name}__${tool.name}`,
      server: name,
    }));
  }

  /**
   * Get documentation for a server (for GUI)
   */
  public async getServerDocs(serverName: string): Promise<any> {
    const connection = this.connections.get(serverName);
    if (!connection) {
      throw new Error(`Server ${serverName} not found`);
    }

    // Return server documentation
    // This would typically come from the server's description or external docs
    return {
      name: serverName,
      description: connection.config.description,
      category: connection.config.category,
      tools: connection.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
      repository: this.getServerRepository(serverName),
      documentation: this.getServerDocumentationUrl(serverName),
    };
  }

  /**
   * Get repository URL for a server
   */
  private getServerRepository(serverName: string): string {
    const repos: Record<string, string> = {
      blender: 'https://github.com/ahujasid/blender-mcp',
      godot: 'https://github.com/ee0pdt/Godot-MCP',
      unity: 'https://github.com/nurture-tech/unity-mcp-server',
      github: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
      discord: 'https://github.com/v-3/discordmcp',
    };
    return repos[serverName] || '';
  }

  /**
   * Get documentation URL for a server
   */
  private getServerDocumentationUrl(serverName: string): string {
    const docs: Record<string, string> = {
      blender: 'https://github.com/ahujasid/blender-mcp#readme',
      godot: 'https://github.com/ee0pdt/Godot-MCP#readme',
      unity: 'https://github.com/nurture-tech/unity-mcp-server#readme',
      github: 'https://github.com/modelcontextprotocol/servers/blob/main/src/github/README.md',
      discord: 'https://github.com/v-3/discordmcp#readme',
    };
    return docs[serverName] || '';
  }

  /**
   * Disconnect all servers
   */
  public async disconnectAll(): Promise<void> {
    logger.info('Disconnecting all servers...');

    // Close all MCP clients (this will also terminate spawned processes)
    for (const [name, client] of this.clients) {
      try {
        await client.close();
        logger.info(`Disconnected from server: ${name}`);
      } catch (error) {
        logger.error(`Error closing MCP client for server ${name}:`, error);
      }
    }

    this.clients.clear();
    this.connections.clear();
  }
}
