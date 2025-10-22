/**
 * WebSocket Handler - Real-time updates for GUI clients
 */

import { WebSocketServer, WebSocket } from 'ws';
import { HubServer } from '../server/hub-server.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export class WebSocketHandler {
  private wss: WebSocketServer;
  private hubServer: HubServer;
  private clients: Set<WebSocket> = new Set();
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(hubServer: HubServer, wss: WebSocketServer) {
    this.hubServer = hubServer;
    this.wss = wss;
  }

  /**
   * Start WebSocket handling
   */
  public start(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('[WebSocket] Client connected');
      this.clients.add(ws);

      // Send initial data
      this.sendInitialData(ws);

      ws.on('message', (message: string) => {
        this.handleMessage(ws, message.toString());
      });

      ws.on('close', () => {
        logger.info('[WebSocket] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error: Error) => {
        logger.error('[WebSocket] Client error:', error);
        this.clients.delete(ws);
      });
    });

    // Start periodic updates
    this.startPeriodicUpdates();

    // Subscribe to logger events
    logger.on('log', (logEntry: any) => {
      this.broadcast('log-entry', logEntry);
    });
  }

  /**
   * Stop WebSocket handling
   */
  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Close all client connections
    for (const client of this.clients) {
      client.close();
    }
    this.clients.clear();
  }

  /**
   * Send initial data to new client
   */
  private async sendInitialData(ws: WebSocket): Promise<void> {
    try {
      const servers = await this.hubServer.getServerStatuses();
      const analytics = await this.hubServer.getAnalytics();

      this.send(ws, 'initial-data', {
        servers,
        analytics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('[WebSocket] Failed to send initial data:', error);
    }
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message);
      logger.debug(`[WebSocket] Received message: ${data.type}`);

      switch (data.type) {
        case 'ping':
          this.send(ws, 'pong', { timestamp: new Date().toISOString() });
          break;

        case 'subscribe-logs':
          // Client wants to receive log updates
          logger.debug('[WebSocket] Client subscribed to logs');
          break;

        case 'unsubscribe-logs':
          // Client wants to stop receiving log updates
          logger.debug('[WebSocket] Client unsubscribed from logs');
          break;

        default:
          logger.warn(`[WebSocket] Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('[WebSocket] Failed to handle message:', error);
    }
  }

  /**
   * Start periodic status updates
   */
  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        const servers = await this.hubServer.getServerStatuses();
        this.broadcast('server-status-update', { servers });
      } catch (error) {
        logger.error('[WebSocket] Failed to send periodic update:', error);
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Send message to specific client
   */
  private send(ws: WebSocket, type: string, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  private broadcast(type: string, data: any): void {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * Broadcast server status change
   */
  public broadcastServerStatusChange(serverName: string, status: string): void {
    this.broadcast('server-status-changed', { serverName, status });
  }

  /**
   * Broadcast analytics update
   */
  public broadcastAnalyticsUpdate(analytics: any): void {
    this.broadcast('analytics-update', analytics);
  }
}
