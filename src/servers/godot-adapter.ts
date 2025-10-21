/**
 * Godot MCP Server Adapter
 * 
 * Integrates ee0pdt/Godot-MCP server into the GameDev MCP Hub
 * 
 * @see https://github.com/ee0pdt/Godot-MCP
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { ServerConfig, ToolCall, ToolResult } from '../types/hub-types';
import { logger } from '../utils/logger';

export interface GodotAdapterConfig extends ServerConfig {
  serverPath: string;  // Path to godot-mcp/server/dist/index.js
  godotProjectPath?: string;
}

export class GodotAdapter extends EventEmitter {
  private config: GodotAdapterConfig;
  private process: ChildProcess | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 3;

  constructor(config: GodotAdapterConfig) {
    super();
    this.config = config;
  }

  /**
   * Start the Godot MCP server process
   */
  async start(): Promise<void> {
    logger.info('[Godot] Starting Godot MCP server...');

    try {
      this.process = spawn('node', [this.config.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MCP_TRANSPORT: 'stdio',
          GODOT_PROJECT_PATH: this.config.godotProjectPath || '',
        },
      });

      this.setupProcessHandlers();
      this.connected = true;
      this.emit('connected');
      logger.info('[Godot] Server started successfully');
    } catch (error) {
      logger.error('[Godot] Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the Godot MCP server
   */
  async stop(): Promise<void> {
    logger.info('[Godot] Stopping Godot MCP server...');
    
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.connected = false;
      this.emit('disconnected');
    }
  }

  /**
   * Execute a tool on the Godot MCP server
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    if (!this.connected || !this.process) {
      throw new Error('Godot MCP server is not connected');
    }

    logger.info(`[Godot] Executing tool: ${toolCall.name}`);

    try {
      // Send tool call via stdin
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

      // Wait for response (implement proper response handling)
      const result = await this.waitForResponse(toolCall.id);

      return {
        success: true,
        data: result,
        toolName: toolCall.name,
        executionTime: Date.now() - toolCall.timestamp,
      };
    } catch (error) {
      logger.error(`[Godot] Tool execution failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        toolName: toolCall.name,
        executionTime: Date.now() - toolCall.timestamp,
      };
    }
  }

  /**
   * Get available tools from Godot MCP server
   */
  async listTools(): Promise<string[]> {
    return [
      // Node operations
      'create-node',
      'delete-node',
      'modify-node',
      'get-node-properties',
      'list-child-nodes',
      
      // Script operations
      'create-script',
      'modify-script',
      'read-script',
      'list-project-scripts',
      'analyze-script',
      
      // Scene operations
      'create-scene',
      'save-scene',
      'open-scene',
      'read-scene',
      'list-project-scenes',
      'get-scene-tree',
      
      // Project operations
      'get-project-settings',
      'list-project-resources',
      
      // Editor operations
      'get-editor-state',
      'run-project',
      'stop-project',
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
      logger.debug('[Godot] stdout:', output);
      this.emit('output', output);
    });

    this.process.stderr?.on('data', (data) => {
      const error = data.toString();
      logger.error('[Godot] stderr:', error);
      this.emit('error', error);
    });

    this.process.on('close', (code) => {
      logger.info(`[Godot] Process exited with code ${code}`);
      this.connected = false;
      this.emit('disconnected');
      
      // Attempt reconnection if unexpected exit
      if (code !== 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        logger.info(`[Godot] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.start(), 5000);
      }
    });

    this.process.on('error', (error) => {
      logger.error('[Godot] Process error:', error);
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

      // Implement proper response handling here
      // This is a placeholder
      clearTimeout(timeout);
      resolve({ status: 'ok' });
    });
  }
}

export default GodotAdapter;
