/**
 * Usage Analytics - Track tool usage and performance metrics
 */

import type { AnalyticsData } from '../types/hub-types.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

interface CallRecord {
  tool: string;
  server: string;
  timestamp: Date;
  latency: number;
  success: boolean;
}

export class UsageAnalytics {
  private calls: CallRecord[] = [];
  private errors: Map<string, number> = new Map();

  /**
   * Record a tool call
   */
  public recordCall(toolName: string, latency: number, success: boolean = true): void {
    const serverName = toolName.split('__')[0] || 'unknown';

    const record: CallRecord = {
      tool: toolName,
      server: serverName,
      timestamp: new Date(),
      latency,
      success,
    };

    this.calls.push(record);

    logger.debug(`Recorded call to ${toolName} (latency: ${latency}ms, success: ${success})`);
  }

  /**
   * Record an error
   */
  public recordError(toolName: string): void {
    const currentCount = this.errors.get(toolName) || 0;
    this.errors.set(toolName, currentCount + 1);

    this.recordCall(toolName, 0, false);

    logger.debug(`Recorded error for ${toolName} (total errors: ${currentCount + 1})`);
  }

  /**
   * Get analytics data
   */
  public getAnalytics(since?: Date): AnalyticsData {
    let records = this.calls;

    if (since) {
      records = records.filter((r) => r.timestamp >= since);
    }

    const totalCalls = records.length;
    const successfulCalls = records.filter((r) => r.success);
    const totalErrors = records.filter((r) => !r.success).length;

    // Calculate metrics
    const callsByServer: Record<string, number> = {};
    const callsByTool: Record<string, number> = {};
    const tokensByServer: Record<string, number> = {}; // Stub - tokens tracked separately
    const tokensByTool: Record<string, number> = {}; // Stub - tokens tracked separately

    let totalLatency = 0;

    for (const record of records) {
      callsByServer[record.server] = (callsByServer[record.server] || 0) + 1;
      callsByTool[record.tool] = (callsByTool[record.tool] || 0) + 1;
      totalLatency += record.latency;
    }

    const averageLatency = totalCalls > 0 ? totalLatency / totalCalls : 0;

    return {
      totalCalls,
      totalTokens: 0, // Will be filled by TokenTracker
      callsByServer,
      callsByTool,
      tokensByServer,
      tokensByTool,
      errors: totalErrors,
      averageLatency,
    };
  }

  /**
   * Get analytics for a specific timeframe
   */
  public getAnalyticsForTimeframe(
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'all'
  ): AnalyticsData {
    let since: Date | undefined;

    const now = new Date();

    switch (timeframe) {
      case 'hour':
        since = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        since = undefined;
        break;
    }

    return this.getAnalytics(since);
  }

  /**
   * Get top tools by usage
   */
  public getTopTools(limit: number = 10, since?: Date): Array<{ tool: string; count: number }> {
    const analytics = this.getAnalytics(since);

    return Object.entries(analytics.callsByTool)
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get error rate
   */
  public getErrorRate(since?: Date): number {
    const analytics = this.getAnalytics(since);

    if (analytics.totalCalls === 0) return 0;

    return (analytics.errors / analytics.totalCalls) * 100;
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(
    since?: Date
  ): {
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    slowestTool: string | null;
    fastestTool: string | null;
  } {
    let records = this.calls;

    if (since) {
      records = records.filter((r) => r.timestamp >= since);
    }

    if (records.length === 0) {
      return {
        averageLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        slowestTool: null,
        fastestTool: null,
      };
    }

    const latencies = records.map((r) => r.latency).sort((a, b) => a - b);
    const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;

    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);

    const p95Latency = latencies[p95Index] || 0;
    const p99Latency = latencies[p99Index] || 0;

    const sortedByLatency = [...records].sort((a, b) => b.latency - a.latency);
    const slowestTool = sortedByLatency[0]?.tool || null;
    const fastestTool = sortedByLatency[sortedByLatency.length - 1]?.tool || null;

    return {
      averageLatency,
      p95Latency,
      p99Latency,
      slowestTool,
      fastestTool,
    };
  }

  /**
   * Reset analytics
   */
  public reset(): void {
    logger.info('Resetting usage analytics');
    this.calls = [];
    this.errors.clear();
  }

  /**
   * Get call history
   */
  public getHistory(limit?: number): CallRecord[] {
    if (limit) {
      return this.calls.slice(-limit);
    }
    return [...this.calls];
  }
}
