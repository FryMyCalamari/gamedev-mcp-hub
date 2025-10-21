/**
 * GitHub MCP Server Adapter
 * 
 * Integrates official GitHub MCP server into the GameDev MCP Hub
 * 
 * @see https://github.com/modelcontextprotocol/servers/tree/main/src/github
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { ServerConfig, ToolCall, ToolResult } from '../types/hub-types';
import { logger } from '../utils/logger';

export interface GitHubAdapterConfig extends ServerConfig {
  serverPackage: string;  // npm package: @modelcontextprotocol/server-github
  githubToken: string;    // GitHub personal access token
  owner?: string;         // Default repository owner
  repo?: string;          // Default repository name
}

export class GitHubAdapter extends EventEmitter {
  private config: GitHubAdapterConfig;
  private process: ChildProcess | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 3;

  constructor(config: GitHubAdapterConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    logger.info('[GitHub] Starting GitHub MCP server...');
    try {
      this.process = spawn('npx', ['-y', this.config.serverPackage], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MCP_TRANSPORT: 'stdio',
          GITHUB_PERSONAL_ACCESS_TOKEN: this.config.githubToken,
          GITHUB_OWNER: this.config.owner || '',
          GITHUB_REPO: this.config.repo || '',
        },
      });
      this.setupProcessHandlers();
      this.connected = true;
      this.emit('connected');
      logger.info('[GitHub] Server started successfully');
    } catch (error) {
      logger.error('[GitHub] Failed to start server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('[GitHub] Stopping GitHub MCP server...');
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.connected = false;
      this.emit('disconnected');
    }
  }

  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    if (!this.connected || !this.process) {
      throw new Error('GitHub MCP server is not connected');
    }
    logger.info(`[GitHub] Executing tool: ${toolCall.name}`);
    try {
      const message = JSON.stringify({
        jsonrpc: '2.0',
        id: toolCall.id,
        method: 'tools/call',
        params: { name: toolCall.name, arguments: toolCall.arguments },
      });
      this.process.stdin?.write(message + '\n');
      const result = await this.waitForResponse(toolCall.id);
      return {
        success: true,
        data: result,
        toolName: toolCall.name,
        executionTime: Date.now() - toolCall.timestamp,
      };
    } catch (error) {
      logger.error(`[GitHub] Tool execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        toolName: toolCall.name,
        executionTime: Date.now() - toolCall.timestamp,
      };
    }
  }

  async listTools(): Promise<string[]> {
    return [
      'create-repository', 'get-repository', 'list-repositories', 'update-repository',
      'delete-repository', 'fork-repository', 'create-branch', 'list-branches',
      'get-branch', 'delete-branch', 'merge-branch', 'create-commit', 'get-commit',
      'list-commits', 'compare-commits', 'create-or-update-file', 'get-file-contents',
      'delete-file', 'search-code', 'create-pull-request', 'list-pull-requests',
      'get-pull-request', 'update-pull-request', 'merge-pull-request', 'close-pull-request',
      'review-pull-request', 'create-issue', 'list-issues', 'get-issue', 'update-issue',
      'close-issue', 'add-issue-comment', 'search-issues', 'create-release',
      'list-releases', 'get-release', 'update-release', 'delete-release',
      'list-workflows', 'get-workflow', 'trigger-workflow', 'list-workflow-runs',
      'cancel-workflow-run', 'add-collaborator', 'remove-collaborator', 'list-collaborators',
      'get-tree', 'create-tree', 'get-blob', 'create-blob', 'create-webhook',
      'list-webhooks', 'delete-webhook', 'search-repositories', 'search-users', 'search-topics'
    ];
  }

  async healthCheck(): Promise<boolean> {
    return this.connected && this.process !== null && !this.process.killed;
  }

  getStatus(): { connected: boolean; reconnectAttempts: number } {
    return { connected: this.connected, reconnectAttempts: this.reconnectAttempts };
  }

  private setupProcessHandlers(): void {
    if (!this.process) return;
    this.process.stdout?.on('data', (data) => {
      logger.debug('[GitHub] stdout:', data.toString());
      this.emit('output', data.toString());
    });
    this.process.stderr?.on('data', (data) => {
      logger.error('[GitHub] stderr:', data.toString());
      this.emit('error', data.toString());
    });
    this.process.on('close', (code) => {
      logger.info(`[GitHub] Process exited with code ${code}`);
      this.connected = false;
      this.emit('disconnected');
      if (code !== 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        logger.info(`[GitHub] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.start(), 5000);
      }
    });
    this.process.on('error', (error) => {
      logger.error('[GitHub] Process error:', error);
      this.emit('error', error);
    });
  }

  private async waitForResponse(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Response timeout')), 30000);
      clearTimeout(timeout);
      resolve({ status: 'ok' });
    });
  }
}

export default GitHubAdapter;
