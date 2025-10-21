/**
 * Unity MCP Server Adapter
 * 
 * Integrates nurture-tech/unity-mcp-server into the GameDev MCP Hub
 * 
 * @see https://github.com/nurture-tech/unity-mcp-server
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { ServerConfig, ToolCall, ToolResult } from '../types/hub-types';
import { logger } from '../utils/logger';

export interface UnityAdapterConfig extends ServerConfig {
  serverPackage: string;  // npm package name: @nurture-tech/unity-mcp-runner
  unityProjectPath?: string;
  unityEditorPath?: string;
}

export class UnityAdapter extends EventEmitter {
  private config: UnityAdapterConfig;
  private process: ChildProcess | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 3;

  constructor(config: UnityAdapterConfig) {
    super();
    this.config = config;
  }

  /**
   * Start the Unity MCP server process
   */
  async start(): Promise<void> {
    logger.info('[Unity] Starting Unity MCP server...');

    try {
      // Unity MCP runs via npx
      this.process = spawn('npx', ['-y', this.config.serverPackage], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MCP_TRANSPORT: 'stdio',
          UNITY_PROJECT_PATH: this.config.unityProjectPath || '',
          UNITY_EDITOR_PATH: this.config.unityEditorPath || '',
        },
      });

      this.setupProcessHandlers();
      this.connected = true;
      this.emit('connected');
      logger.info('[Unity] Server started successfully');
    } catch (error) {
      logger.error('[Unity] Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the Unity MCP server
   */
  async stop(): Promise<void> {
    logger.info('[Unity] Stopping Unity MCP server...');
    
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.connected = false;
      this.emit('disconnected');
    }
  }

  /**
   * Execute a tool on the Unity MCP server
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    if (!this.connected || !this.process) {
      throw new Error('Unity MCP server is not connected');
    }

    logger.info(`[Unity] Executing tool: ${toolCall.name}`);

    try {
      const message = JSON.stringify({
        jsonrpc: '2.0',
        id: toolCall.id,
        method: 'tools/call',
        params: {
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
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
      logger.error(`[Unity] Tool execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        toolName: toolCall.name,
        executionTime: Date.now() - toolCall.timestamp,
      };
    }
  }

  /**
   * Get available tools from Unity MCP server
   */
  async listTools(): Promise<string[]> {
    return [
      // GameObject operations
      'create-gameobject',
      'delete-gameobject',
      'find-gameobject',
      'get-gameobject-properties',
      'set-gameobject-properties',
      
      // Component operations
      'add-component',
      'remove-component',
      'get-component',
      'set-component-property',
      
      // Transform operations
      'set-position',
      'set-rotation',
      'set-scale',
      'get-transform',
      
      // Scene operations
      'create-scene',
      'load-scene',
      'save-scene',
      'list-scenes',
      'get-active-scene',
      
      // Project operations
      'get-project-settings',
      'list-assets',
      'create-asset',
      'import-asset',
      
      // Prefab operations
      'create-prefab',
      'instantiate-prefab',
      'update-prefab',
      
      // Script operations
      'create-script',
      'modify-script',
      'attach-script',
      
      // Build operations
      'build-project',
      'get-build-settings',
      'set-build-settings',
      
      // Editor operations
      'run-editor-command',
      'get-editor-state',
      'refresh-assets',
    ];
  }

  /**
   * Check if server is healthy
   */
  async healthCheck(): Promise<boolean> {
    return this.connected && this.process !== null && !this.process.killed;
  }

  /**
   * Get server status
   */
  getStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Setup process event handlers
   */
  private setupProcessHandlers(): void {
    if (!this.process) return;

    this.process.stdout?.on('data', (data) => {
      const output = data.toString();
      logger.debug('[Unity] stdout:', output);
      this.emit('output', output);
    });

    this.process.stderr?.on('data', (data) => {
      const error = data.toString();
      logger.error('[Unity] stderr:', error);
      this.emit('error', error);
    });

    this.process.on('close', (code) => {
      logger.info(`[Unity] Process exited with code ${code}`);
      this.connected = false;
      this.emit('disconnected');
      
      if (code !== 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        logger.info(`[Unity] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.start(), 5000);
      }
    });

    this.process.on('error', (error) => {
      logger.error('[Unity] Process error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Wait for response from server
   * TODO: Implement proper response queue and matching
   */
  private async waitForResponse(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Response timeout'));
      }, 30000);

      // Placeholder - implement actual response handling
      clearTimeout(timeout);
      resolve({ status: 'ok' });
    });
  }
}

export default UnityAdapter;
