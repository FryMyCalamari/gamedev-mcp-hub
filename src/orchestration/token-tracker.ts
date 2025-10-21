/**
 * Token Tracker - Track token usage across tools and servers
 */

import type { TokenUsage } from '../types/hub-types.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export class TokenTracker {
  private usage: TokenUsage[] = [];
  private config: {
    enabled: boolean;
    warning_threshold: number;
    hard_limit: number;
    auto_switch: boolean;
    auto_switch_threshold: number;
    preferred_models: string[];
    track_per_server: boolean;
    track_per_tool: boolean;
  };

  constructor(config: typeof this.config) {
    this.config = config;
  }

  /**
   * Track token usage for a tool call
   */
  public trackUsage(toolName: string, tokens: number): void {
    if (!this.config.enabled) return;

    // Extract server name from tool name
    const serverName = toolName.split('__')[0] || 'unknown';

    const usage: TokenUsage = {
      server: serverName,
      tool: toolName,
      tokens,
      timestamp: new Date(),
    };

    this.usage.push(usage);

    // Check if we're approaching limits
    const currentTotal = this.getTotalTokens();

    if (currentTotal >= this.config.hard_limit) {
      logger.error(`Token hard limit reached: ${currentTotal}/${this.config.hard_limit}`);
    } else if (currentTotal >= this.config.warning_threshold) {
      logger.warn(`Token warning threshold reached: ${currentTotal}/${this.config.warning_threshold}`);
    }

    if (this.config.auto_switch && currentTotal >= this.config.auto_switch_threshold) {
      logger.info('Auto-switch threshold reached, consider switching API');
      // In a real implementation, this would trigger an API switch
    }

    logger.debug(`Tracked ${tokens} tokens for ${toolName} (total: ${currentTotal})`);
  }

  /**
   * Get total tokens used
   */
  public getTotalTokens(since?: Date): number {
    let entries = this.usage;

    if (since) {
      entries = entries.filter((u) => u.timestamp >= since);
    }

    return entries.reduce((sum, u) => sum + u.tokens, 0);
  }

  /**
   * Get tokens by server
   */
  public getTokensByServer(since?: Date): Record<string, number> {
    let entries = this.usage;

    if (since) {
      entries = entries.filter((u) => u.timestamp >= since);
    }

    const byServer: Record<string, number> = {};

    for (const entry of entries) {
      byServer[entry.server] = (byServer[entry.server] || 0) + entry.tokens;
    }

    return byServer;
  }

  /**
   * Get tokens by tool
   */
  public getTokensByTool(since?: Date): Record<string, number> {
    let entries = this.usage;

    if (since) {
      entries = entries.filter((u) => u.timestamp >= since);
    }

    const byTool: Record<string, number> = {};

    for (const entry of entries) {
      byTool[entry.tool] = (byTool[entry.tool] || 0) + entry.tokens;
    }

    return byTool;
  }

  /**
   * Get current status
   */
  public getStatus(): {
    totalTokens: number;
    warningThreshold: number;
    hardLimit: number;
    percentUsed: number;
    shouldSwitch: boolean;
    byServer: Record<string, number>;
    byTool: Record<string, number>;
  } {
    const total = this.getTotalTokens();
    const percentUsed = (total / this.config.hard_limit) * 100;
    const shouldSwitch =
      this.config.auto_switch && total >= this.config.auto_switch_threshold;

    return {
      totalTokens: total,
      warningThreshold: this.config.warning_threshold,
      hardLimit: this.config.hard_limit,
      percentUsed,
      shouldSwitch,
      byServer: this.getTokensByServer(),
      byTool: this.getTokensByTool(),
    };
  }

  /**
   * Reset usage tracking
   */
  public reset(): void {
    logger.info('Resetting token usage tracking');
    this.usage = [];
  }

  /**
   * Get usage history
   */
  public getHistory(limit?: number): TokenUsage[] {
    if (limit) {
      return this.usage.slice(-limit);
    }
    return [...this.usage];
  }
}
