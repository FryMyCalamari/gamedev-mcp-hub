/**
 * Hub Server - Core implementation of the GameDev MCP Hub
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type {
  HubConfig,
  Tool,
  Resource,
  ToolResult,
} from '../types/hub-types.js';
import { ConnectionManager } from './connection-manager.js';
import { ToolRouter } from './tool-router.js';
import { ToolRegistry } from '../registry/tool-index.js';
import { TokenTracker } from '../orchestration/token-tracker.js';
import { UsageAnalytics } from '../orchestration/usage-analytics.js';
import { Logger } from '../utils/logger.js';
import { ConfigLoader } from '../utils/config-loader.js';

const logger = Logger.getInstance();

export class HubServer {
  private connectionManager: ConnectionManager;
  private toolRouter: ToolRouter;
  private toolRegistry: ToolRegistry;
  private tokenTracker: TokenTracker;
  private usageAnalytics: UsageAnalytics;
  private config: HubConfig;
  private stdioClients: Map<string, { name: string; connectedAt: Date; toolsUsed: number }> = new Map();

  constructor(config: HubConfig, _mcpServer: Server) {
    this.config = config;

    this.connectionManager = new ConnectionManager();
    this.toolRouter = new ToolRouter(this.connectionManager);
    this.toolRegistry = new ToolRegistry();
    this.tokenTracker = new TokenTracker(config.token_management);
    this.usageAnalytics = new UsageAnalytics();
  }

  /**
   * Initialize the hub server and connect to downstream MCP servers
   */
  public async initialize(): Promise<void> {
    logger.info('Initializing GameDev MCP Hub...');

    try {
      // Load server configurations
      const serversConfig = await ConfigLoader.loadServersConfig();
      const categoriesConfig = await ConfigLoader.loadCategoriesConfig();

      // Load categories into registry
      this.toolRegistry.loadCategories(categoriesConfig);

      // Connect to enabled servers
      await this.connectionManager.connectServers(serversConfig);

      // Register all tools from connected servers
      const allTools = await this.connectionManager.getAllTools();
      allTools.forEach((tool) => {
        this.toolRegistry.registerTool(tool);
      });

      // Start health checks if enabled
      if (this.config.health_check.enabled) {
        this.startHealthChecks();
      }

      logger.info(`Hub initialized with ${this.getConnectedServersCount()} connected servers`);
      logger.info(`Total tools available: ${allTools.length}`);
    } catch (error) {
      logger.error('Failed to initialize hub:', error);
      throw error;
    }
  }

  /**
   * List all available tools from all connected servers
   * Optimized for LLM context: shortened descriptions
   */
  public async listTools(): Promise<{ tools: Tool[] }> {
    const tools = this.toolRegistry.getAllTools();
    
    // Optimize tool descriptions for smaller context usage
    const optimizedTools = tools.map(tool => ({
      ...tool,
      description: this.shortenDescription(tool.description)
    }));

    // Add hub-specific management tools (also optimized)
    const hubTools: Tool[] = [
      {
        name: 'hub__search_tools',
        description: 'Search tools by name/category',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            category: {
              type: 'string',
              description: 'Filter by category (optional)',
            },
          },
          required: ['query'],
        },
        category: 'hub',
        server: 'hub',
      },
      {
        name: 'hub__list_servers',
        description: 'List connected servers',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        category: 'hub',
        server: 'hub',
      },
      {
        name: 'hub__get_analytics',
        description: 'Get usage analytics for tools and servers',
        inputSchema: {
          type: 'object',
          properties: {
            timeframe: {
              type: 'string',
              enum: ['hour', 'day', 'week', 'month', 'all'],
              description: 'Timeframe for analytics',
            },
          },
        },
        category: 'hub',
        server: 'hub',
      },
      {
        name: 'hub__check_tokens',
        description: 'Check current token usage and get recommendations',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        category: 'hub',
        server: 'hub',
      },
    ];

    return {
      tools: [...hubTools, ...optimizedTools],
    };
  }

  /**
   * Shorten tool descriptions to save context
   */
  private shortenDescription(description: string): string {
    // If description is already short, return as-is
    if (description.length <= 60) {
      return description;
    }
    
    // Take first sentence or first 60 chars
    const firstSentence = description.split(/[.!?]/)[0];
    if (firstSentence.length <= 60) {
      return firstSentence.trim();
    }
    
    return description.substring(0, 57).trim() + '...';
  }

  /**
   * Call a tool on the appropriate server
   */
  public async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Handle hub-specific tools
      if (name.startsWith('hub__')) {
        return await this.handleHubTool(name, args);
      }

      // Route tool call to appropriate server
      const result = await this.toolRouter.routeToolCall(name, args);

      // Track usage
      const latency = Date.now() - startTime;
      this.usageAnalytics.recordCall(name, latency);

      // Track tokens if available
      if (result.tokens) {
        this.tokenTracker.trackUsage(name, result.tokens);
      }

      return result;
    } catch (error) {
      logger.error(`Failed to call tool ${name}:`, error);
      this.usageAnalytics.recordError(name);

      return {
        content: [
          {
            type: 'text',
            text: `Error calling tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Register a stdio client for tracking
   */
  public registerStdioClient(name: string): void {
    const clientId = `stdio-${Date.now()}`;
    this.stdioClients.set(clientId, {
      name,
      connectedAt: new Date(),
      toolsUsed: 0,
    });
    logger.info(`[Client] Registered stdio client: ${name}`);
  }

  /**
   * Get all connected clients (stdio + SSE)
   */
  public getConnectedClients(): Array<{ id: string; name: string; connectedAt: Date; toolsUsed: number; transport: string; duration: number }> {
    return Array.from(this.stdioClients.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      connectedAt: data.connectedAt,
      toolsUsed: data.toolsUsed,
      transport: 'stdio',
      duration: Math.floor((Date.now() - data.connectedAt.getTime()) / 1000),
    }));
  }

  /**
   * List available resources (including skills)
   */
  public async listResources(): Promise<{ resources: Resource[] }> {
    const resources: Resource[] = [
      {
        uri: 'hub://config',
        name: 'Hub Configuration',
        description: 'Current hub configuration',
        mimeType: 'application/json',
      },
      {
        uri: 'hub://servers',
        name: 'Connected Servers',
        description: 'List of connected MCP servers',
        mimeType: 'application/json',
      },
      {
        uri: 'hub://analytics',
        name: 'Usage Analytics',
        description: 'Tool usage analytics',
        mimeType: 'application/json',
      },
      // Skills - Specialized workflows for game development
      {
        uri: 'skill://algorithmic-art',
        name: 'Algorithmic Art Skill',
        description: 'Create generative art and procedural visuals',
        mimeType: 'text/markdown',
      },
      {
        uri: 'skill://mcp-builder',
        name: 'MCP Builder Skill',
        description: 'Build new MCP servers to integrate tools',
        mimeType: 'text/markdown',
      },
    ];

    return { resources };
  }

  /**
   * Read a resource
   */
  public async readResource(uri: string): Promise<{ contents: Array<{ uri: string; mimeType?: string; text?: string }> }> {
    if (uri === 'hub://config') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(this.config, null, 2),
          },
        ],
      };
    }

    if (uri === 'hub://servers') {
      const servers = this.connectionManager.getServerStatus();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(servers, null, 2),
          },
        ],
      };
    }

    if (uri === 'hub://analytics') {
      const analytics = this.usageAnalytics.getAnalytics();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(analytics, null, 2),
          },
        ],
      };
    }

    // Handle skills
    if (uri.startsWith('skill://')) {
      const skillName = uri.replace('skill://', '');
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        const skillPath = path.join(process.cwd(), 'skills', skillName, 'SKILL.md');
        const skillContent = await fs.readFile(skillPath, 'utf-8');
        
        return {
          contents: [
            {
              uri,
              mimeType: 'text/markdown',
              text: skillContent,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Skill not found: ${skillName}`);
      }
    }

    throw new Error(`Resource not found: ${uri}`);
  }

  /**
   * Handle hub-specific tool calls
   */
  private async handleHubTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    switch (name) {
      case 'hub__search_tools': {
        const query = args.query as string;
        const category = args.category as string | undefined;
        const results = this.toolRegistry.searchTools(query, category);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'hub__list_servers': {
        const servers = this.connectionManager.getServerStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(servers, null, 2),
            },
          ],
        };
      }

      case 'hub__get_analytics': {
        const analytics = this.usageAnalytics.getAnalytics();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analytics, null, 2),
            },
          ],
        };
      }

      case 'hub__check_tokens': {
        const status = this.tokenTracker.getStatus();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown hub tool: ${name}`);
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    setInterval(() => {
      void this.performHealthCheck();
    }, this.config.health_check.interval);
  }

  /**
   * Perform health check on all servers
   */
  private async performHealthCheck(): Promise<void> {
    try {
      await this.connectionManager.healthCheck();
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }

  /**
   * Get count of connected servers
   */
  public getConnectedServersCount(): number {
    return this.connectionManager.getConnectedCount();
  }

  /**
   * Get server statuses (for GUI)
   */
  public async getServerStatuses(): Promise<any[]> {
    return this.connectionManager.getServerStatus();
  }

  /**
   * Connect a specific server (for GUI)
   */
  public async connectServer(name: string): Promise<void> {
    await this.connectionManager.connectServerByName(name);
    
    // Re-register tools from this server
    const tools = await this.connectionManager.getServerTools(name);
    tools.forEach((tool) => {
      this.toolRegistry.registerTool(tool);
    });
    
    logger.info(`[GUI] Server ${name} connected`);
  }

  /**
   * Disconnect a specific server (for GUI)
   */
  public async disconnectServer(name: string): Promise<void> {
    await this.connectionManager.disconnectServerByName(name);
    logger.info(`[GUI] Server ${name} disconnected`);
  }

  /**
   * Connect all enabled servers (for GUI)
   */
  public async connectAllServers(): Promise<void> {
    const serversConfig = await ConfigLoader.loadServersConfig();
    await this.connectionManager.connectServers(serversConfig);
    
    // Re-register all tools
    const allTools = await this.connectionManager.getAllTools();
    allTools.forEach((tool) => {
      this.toolRegistry.registerTool(tool);
    });
    
    logger.info('[GUI] All enabled servers connected');
  }

  /**
   * Disconnect all servers (for GUI)
   */
  public async disconnectAllServers(): Promise<void> {
    await this.connectionManager.disconnectAll();
    logger.info('[GUI] All servers disconnected');
  }

  /**
   * Get analytics (for GUI)
   */
  public async getAnalytics(): Promise<any> {
    return this.usageAnalytics.getAnalytics();
  }

  /**
   * Get recent logs (for GUI)
   */
  public async getRecentLogs(limit: number = 100): Promise<any[]> {
    return logger.getRecentLogs(limit);
  }

  /**
   * Get documentation for a server (for GUI)
   */
  public async getServerDocs(serverName: string): Promise<any> {
    return this.connectionManager.getServerDocs(serverName);
  }

  /**
   * Get connection manager instance (for internal use)
   */
  public getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }

  /**
   * Shutdown the hub gracefully
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down GameDev MCP Hub...');
    await this.connectionManager.disconnectAll();
    logger.info('Hub shutdown complete');
  }
}
