#!/usr/bin/env node

/**
 * GameDev MCP Hub - SSE Transport Entry Point
 * 
 * Enables multiple AI clients to connect simultaneously via Server-Sent Events
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { HubServer } from './server/hub-server.js';
import { GuiServer } from './gui/gui-server.js';
import { ConfigLoader } from './utils/config-loader.js';
import { Logger } from './utils/logger.js';

const logger = Logger.getInstance();

// Track connected clients with memory cleanup
const connectedClients: Map<string, { name: string; connectedAt: Date; toolsUsed: number }> = new Map();

// Periodic cleanup for stale client entries (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_CLIENT_IDLE_TIME = 60 * 60 * 1000; // 1 hour

function cleanupStaleClients() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [clientId, data] of connectedClients.entries()) {
    const idleTime = now - data.connectedAt.getTime();
    if (idleTime > MAX_CLIENT_IDLE_TIME) {
      connectedClients.delete(clientId);
      cleaned++;
      logger.info(`[Cleanup] Removed stale client: ${data.name} (${clientId})`);
    }
  }
  
  if (cleaned > 0) {
    logger.info(`[Cleanup] Removed ${cleaned} stale client entries`);
  }
}

/**
 * Initialize and start the GameDev MCP Hub with SSE transport
 */
async function main() {
  try {
    logger.info('Starting GameDev MCP Hub with SSE transport...');
    
    // Detect and register stdio client (Factory Droid / Claude)
    if (process.stdin.isTTY === false || process.env.FACTORY_CLIENT === 'true') {
      connectedClients.set('factory-stdio', {
        name: 'Factory Droid (stdio)',
        connectedAt: new Date(),
        toolsUsed: 0,
      });
      logger.info('[Client] Detected stdio client: Factory Droid');
    }

    // Load configuration
    const config = await ConfigLoader.loadConfig();
    logger.info(`Configuration loaded: ${config.hub.name} v${config.hub.version}`);

    // Create Express app for SSE
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Initialize hub server (shared across all clients)
    const server = new Server(
      {
        name: config.hub.name,
        version: config.hub.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    const hubServer = new HubServer(config, server);
    await hubServer.initialize();

    // Start GUI server
    let guiServer: GuiServer | null = null;
    if (config.features?.rest_api) {
      guiServer = new GuiServer(hubServer, 3100);
      await guiServer.start();
    }

    // Register MCP handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return hubServer.listTools();
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const result = await hubServer.callTool(request.params.name, request.params.arguments ?? {});
      return result as any;
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return hubServer.listResources();
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return hubServer.readResource(request.params.uri);
    });

    // SSE endpoint for MCP clients
    app.get('/sse', async (req, res) => {
      const clientId = req.headers['x-client-id'] as string || `client-${Date.now()}`;
      const clientName = req.headers['x-client-name'] as string || 'Unknown Client';
      
      logger.info(`[SSE] New client connecting: ${clientName} (${clientId})`);
      
      // Track client connection
      connectedClients.set(clientId, {
        name: clientName,
        connectedAt: new Date(),
        toolsUsed: 0,
      });

      // Create SSE transport for this client
      const transport = new SSEServerTransport('/message', res);
      
      // Handle client disconnect
      req.on('close', () => {
        logger.info(`[SSE] Client disconnected: ${clientName} (${clientId})`);
        connectedClients.delete(clientId);
      });

      // Connect the server to this client's transport
      await server.connect(transport);
      
      logger.info(`[SSE] Client connected successfully: ${clientName}`);
    });

    // POST endpoint for client messages
    app.post('/message', async (_req, res) => {
      // This is handled by SSE transport
      res.status(200).send();
    });

    // API endpoint to get connected clients (for GUI)
    app.get('/api/clients', (_req, res) => {
      const clients = Array.from(connectedClients.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        connectedAt: data.connectedAt,
        toolsUsed: data.toolsUsed,
        duration: Math.floor((Date.now() - data.connectedAt.getTime()) / 1000), // seconds
      }));
      
      res.json({ clients });
    });

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        version: config.hub.version,
        servers: hubServer.getConnectedServersCount(),
        clients: connectedClients.size,
      });
    });

    // Start Express server
    const PORT = process.env.MCP_HUB_PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`GameDev MCP Hub (SSE) listening on port ${PORT}`);
      logger.info(`MCP endpoint: http://localhost:${PORT}/sse`);
      logger.info(`GUI: http://localhost:3100`);
      logger.info(`Downstream servers: ${hubServer.getConnectedServersCount()}`);
      logger.info('Multiple clients can now connect simultaneously!');
    });

    // Start periodic cleanup of stale client entries
    const cleanupTimer = setInterval(cleanupStaleClients, CLEANUP_INTERVAL);
    logger.info('[Cleanup] Periodic client cleanup enabled (every 5 minutes)');

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      
      // Clear cleanup timer
      if (cleanupTimer) {
        clearInterval(cleanupTimer);
        logger.info('[Cleanup] Stopped periodic cleanup');
      }
      
      // Clear connected clients map
      connectedClients.clear();
      logger.info('[Cleanup] Cleared client connections');
      
      if (guiServer) await guiServer.stop();
      await hubServer.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start GameDev MCP Hub (SSE):', error);
    process.exit(1);
  }
}

// Export for testing
export { connectedClients };

// Start the hub
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
