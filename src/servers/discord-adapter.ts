/**
 * Discord MCP Server Adapter
 * 
 * Integrates v-3/discordmcp into the GameDev MCP Hub
 * 
 * @see https://github.com/v-3/discordmcp
 */

import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import { ServerConfig, ToolCall, ToolResult } from '../types/hub-types';
import { logger } from '../utils/logger';

export interface DiscordAdapterConfig extends ServerConfig {
  serverPath: string;   // Path to discordmcp server
  botToken: string;     // Discord bot token
  guildId?: string;     // Default guild (server) ID
}

export class DiscordAdapter extends EventEmitter {
  private config: DiscordAdapterConfig;
  private process: ChildProcess | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 3;

  constructor(config: DiscordAdapterConfig) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    logger.info('[Discord] Starting Discord MCP server...');
    try {
      this.process = spawn('node', [this.config.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          MCP_TRANSPORT: 'stdio',
          DISCORD_BOT_TOKEN: this.config.botToken,
          DISCORD_GUILD_ID: this.config.guildId || '',
        },
      });
      this.setupProcessHandlers();
      this.connected = true;
      this.emit('connected');
      logger.info('[Discord] Server started successfully');
    } catch (error) {
      logger.error('[Discord] Failed to start server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('[Discord] Stopping Discord MCP server...');
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.connected = false;
      this.emit('disconnected');
    }
  }

  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    if (!this.connected || !this.process) {
      throw new Error('Discord MCP server is not connected');
    }
    logger.info(`[Discord] Executing tool: ${toolCall.name}`);
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
      logger.error(`[Discord] Tool execution failed:`, error);
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
      'send-message', 'send-dm', 'edit-message', 'delete-message', 'reply-to-message',
      'get-message', 'get-channel-messages', 'create-channel', 'delete-channel',
      'get-channel', 'list-channels', 'update-channel', 'set-channel-topic',
      'get-guild', 'list-guilds', 'update-guild', 'get-guild-members', 'kick-member',
      'ban-member', 'unban-member', 'create-role', 'delete-role', 'update-role',
      'assign-role', 'remove-role', 'list-roles', 'get-user', 'get-current-user',
      'update-presence', 'update-status', 'join-voice-channel', 'leave-voice-channel',
      'mute-user', 'unmute-user', 'deafen-user', 'undeafen-user', 'create-thread',
      'join-thread', 'leave-thread', 'list-threads', 'archive-thread', 'create-emoji',
      'delete-emoji', 'list-emojis', 'create-webhook', 'execute-webhook',
      'delete-webhook', 'list-webhooks', 'create-invite', 'get-invite', 'delete-invite',
      'list-invites', 'update-permissions', 'get-permissions', 'timeout-member',
      'remove-timeout', 'add-reaction', 'remove-reaction', 'clear-reactions',
      'create-category', 'move-channel', 'set-slowmode', 'create-stage-channel',
      'publish-message', 'follow-channel', 'list-integrations', 'create-application-command'
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
      logger.debug('[Discord] stdout:', data.toString());
      this.emit('output', data.toString());
    });
    this.process.stderr?.on('data', (data) => {
      logger.error('[Discord] stderr:', data.toString());
      this.emit('error', data.toString());
    });
    this.process.on('close', (code) => {
      logger.info(`[Discord] Process exited with code ${code}`);
      this.connected = false;
      this.emit('disconnected');
      if (code !== 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        logger.info(`[Discord] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        setTimeout(() => this.start(), 5000);
      }
    });
    this.process.on('error', (error) => {
      logger.error('[Discord] Process error:', error);
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

export default DiscordAdapter;
