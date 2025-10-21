#!/usr/bin/env node

/**
 * GameDev MCP Hub - Main Entry Point
 * 
 * A comprehensive MCP server hub that aggregates multiple game development
 * tools and provides a unified interface for AI assistants.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { HubServer } from './server/hub-server.js';
import { ConfigLoader } from './utils/config-loader.js';
import { Logger } from './utils/logger.js';

const logger = Logger.getInstance();

/**
 * Initialize and start the GameDev MCP Hub
 */
async function main() {
  try {
    logger.info('Starting GameDev MCP Hub...');

    // Load configuration
    const config = await ConfigLoader.loadConfig();
    logger.info(`Configuration loaded: ${config.hub.name} v${config.hub.version}`);

    // Create MCP server
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

    // Initialize hub server
    const hubServer = new HubServer(config, server);
    await hubServer.initialize();

    // Register handlers
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return hubServer.listTools();
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return hubServer.callTool(request.params.name, request.params.arguments ?? {});
    });

    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return hubServer.listResources();
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      return hubServer.readResource(request.params.uri);
    });

    // Start server with stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('GameDev MCP Hub is running on stdio transport');
    logger.info(`Downstream servers: ${hubServer.getConnectedServersCount()}`);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await hubServer.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await hubServer.shutdown();
      process.exit(0);
    });

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
    logger.error('Failed to start GameDev MCP Hub:', error);
    process.exit(1);
  }
}

// Start the hub
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
