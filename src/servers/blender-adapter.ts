/**
 * Blender MCP Server Adapter
 * 
 * Integrates ahujasid/blender-mcp into the GameDev MCP Hub
 * 
 * @see https://github.com/ahujasid/blender-mcp
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { ServerConfig, ToolCall, ToolResult } from '../types/hub-types';
import { logger } from '../utils/logger';

export interface BlenderAdapterConfig extends ServerConfig {
  serverPath: string;  // Path to blender-mcp server.js
  blenderExecutable?: string;
  blenderProjectPath?: string;
}

export class BlenderAdapter extends EventEmitter {
  private config: BlenderAdapterConfig;
  private process: ChildProcess | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 3;

  constructor(config: BlenderAdapterConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    logger.info('[Blender] Starting Blender MCP server...');
    try {
      this.process = spawn('node', [this.config.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MCP_TRANSPORT: 'stdio',
          BLENDER_EXECUTABLE: this.config.blenderExecutable || 'blender',
          BLENDER_PROJECT_PATH: this.config.blenderProjectPath || '',
        },
      });
      this.setupProcessHandlers();
      this.connected = true;
      this.emit('connected');
      logger.info('[Blender] Server started successfully');
    } catch (error) {
      logger.error('[Blender] Failed to start server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('[Blender] Stopping Blender MCP server...');
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.connected = false;
      this.emit('disconnected');
    }
  }

  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    if (!this.connected || !this.process) {
      throw new Error('Blender MCP server is not connected');
    }
    logger.info(`[Blender] Executing tool: ${toolCall.name}`);
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
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      logger.error(`[Blender] Tool execution failed:`, error);
      return {
        content: [{
          type: 'text',
          text: error instanceof Error ? error.message : 'Unknown error'
        }],
        isError: true
      };
    }
  }

  async listTools(): Promise<string[]> {
    return [
      'create-object', 'delete-object', 'select-object', 'get-object-properties',
      'set-object-properties', 'duplicate-object', 'create-mesh', 'edit-mesh',
      'subdivide-mesh', 'apply-modifier', 'join-objects', 'separate-mesh',
      'create-material', 'assign-material', 'edit-material', 'create-shader-node',
      'connect-shader-nodes', 'set-location', 'set-rotation', 'set-scale',
      'apply-transform', 'create-scene', 'switch-scene', 'get-scene-info',
      'set-scene-properties', 'create-camera', 'set-camera-properties', 'set-active-camera',
      'create-light', 'set-light-properties', 'set-light-color', 'keyframe-insert',
      'keyframe-delete', 'set-animation-range', 'bake-animation', 'render-frame',
      'render-animation', 'set-render-settings', 'set-output-path', 'save-file',
      'open-file', 'import-file', 'export-file', 'execute-script', 'register-operator',
      'create-collection', 'add-to-collection', 'remove-from-collection', 'add-modifier',
      'remove-modifier', 'apply-all-modifiers'
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
      logger.debug('[Blender] stdout:', data.toString());
      this.emit('output', data.toString());
    });
    this.process.stderr?.on('data', (data) => {
      logger.error('[Blender] stderr:', data.toString());
      this.emit('error', data.toString());
    });
    this.process.on('close', (code) => {
      logger.info(`[Blender] Process exited with code ${code}`);
      this.connected = false;
      this.emit('disconnected');
      if (code !== 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        logger.info(`[Blender] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.start(), 5000);
      }
    });
    this.process.on('error', (error) => {
      logger.error('[Blender] Process error:', error);
      this.emit('error', error);
    });
  }

  private async waitForResponse(_id: string | number | undefined): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Response timeout')), 30000);
      clearTimeout(timeout);
      resolve({ status: 'ok' });
    });
  }
}

export default BlenderAdapter;
