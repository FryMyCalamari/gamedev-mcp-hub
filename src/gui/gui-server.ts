/**
 * GUI Server - Web interface for MCP Hub management
 * 
 * SECURITY NOTE: This server is designed for LOCAL USE ONLY (localhost).
 * For production deployment, add:
 * - Authentication (JWT, OAuth, or API keys)
 * - HTTPS/TLS encryption
 * - Rate limiting per client
 * - Input validation and sanitization
 * - CORS restrictions
 * - CSP headers
 */

import express, { Express } from 'express';
import { Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'net';
import { HubServer } from '../server/hub-server.js';
import { Logger } from '../utils/logger.js';
import { createApiRoutes } from './api-routes.js';
import { WebSocketHandler } from './websocket-handler.js';

const logger = Logger.getInstance();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GuiServer {
  private app: Express;
  private httpServer: HTTPServer | null = null;
  private wss: WebSocketServer | null = null;
  private wsHandler: WebSocketHandler | null = null;
  private port: number;
  private hubServer: HubServer;

  constructor(hubServer: HubServer, port: number = 3100) {
    this.hubServer = hubServer;
    this.port = port;
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // SECURITY: Localhost only - bind to 127.0.0.1 in start()
    this.app.use(cors({
      origin: 'http://localhost:3100',
      credentials: true,
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files from public directory
    const publicPath = path.join(__dirname, 'public');
    this.app.use(express.static(publicPath));

    // Request logging
    this.app.use((req, _res, next) => {
      logger.debug(`[GUI] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Find available port starting from the preferred port
   */
  private async findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
    for (let i = 0; i < maxAttempts; i++) {
      const testPort = startPort + i;
      const isAvailable = await new Promise<boolean>((resolve) => {
        const server = createServer();
        server.once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            resolve(false);
          } else {
            resolve(false);
          }
        });
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(testPort, '127.0.0.1');
      });
      
      if (isAvailable) {
        if (testPort !== startPort) {
          logger.info(`[GUI] Port ${startPort} in use, found available port: ${testPort}`);
        }
        return testPort;
      }
    }
    
    throw new Error(`No available ports found in range ${startPort}-${startPort + maxAttempts - 1}`);
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use('/api', createApiRoutes(this.hubServer));

    // Serve main page
    this.app.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Health check
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({ error: 'Not found' });
    });

    // Error handler
    this.app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error('[GUI] Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Start the GUI server
   */
  public async start(): Promise<void> {
    try {
      // Find an available port (try 3100-3109)
      this.port = await this.findAvailablePort(this.port);
      
      // SECURITY: Bind to localhost only (127.0.0.1)
      this.httpServer = this.app.listen(this.port, '127.0.0.1', () => {
        logger.info(`[GUI] Server running on http://127.0.0.1:${this.port}`);
        logger.info(`[GUI] Access dashboard at http://localhost:${this.port}`);
        logger.warn('[GUI] SECURITY: Server bound to localhost only - not accessible from network');
      });

      // Setup WebSocket server
      this.wss = new WebSocketServer({ server: this.httpServer });
      this.wsHandler = new WebSocketHandler(this.hubServer, this.wss);
      this.wsHandler.start();

      logger.info('[GUI] WebSocket server initialized');
    } catch (error) {
      logger.error('[GUI] Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the GUI server
   */
  public async stop(): Promise<void> {
    logger.info('[GUI] Stopping GUI server...');

    // Close WebSocket connections
    if (this.wsHandler) {
      this.wsHandler.stop();
    }

    if (this.wss) {
      this.wss.close();
    }

    // Close HTTP server
    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => {
          logger.info('[GUI] HTTP server closed');
          resolve();
        });
      });
    }
  }

  /**
   * Get server status
   */
  public getStatus(): { running: boolean; port: number; clients: number } {
    return {
      running: this.httpServer !== null,
      port: this.port,
      clients: this.wss?.clients.size || 0,
    };
  }
}
