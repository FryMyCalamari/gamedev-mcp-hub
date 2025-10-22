/**
 * API Routes - REST endpoints for GUI server
 */

import { Router } from 'express';
import { HubServer } from '../server/hub-server.js';
import { Logger } from '../utils/logger.js';

const logger = Logger.getInstance();

export function createApiRoutes(hubServer: HubServer): Router {
  const router = Router();

  /**
   * GET /api/servers - Get all server statuses
   */
  router.get('/servers', async (_req, res) => {
    try {
      const servers = await hubServer.getServerStatuses();
      res.json({ servers });
    } catch (error) {
      logger.error('[API] Failed to get servers:', error);
      res.status(500).json({ error: 'Failed to get server statuses' });
    }
  });

  /**
   * POST /api/servers/:name/connect - Connect a server
   */
  router.post('/servers/:name/connect', async (req, res) => {
    try {
      const { name } = req.params;
      await hubServer.connectServer(name);
      res.json({ success: true, message: `Server ${name} connected` });
    } catch (error) {
      logger.error(`[API] Failed to connect server ${req.params.name}:`, error);
      res.status(500).json({ 
        error: 'Failed to connect server',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/servers/:name/disconnect - Disconnect a server
   */
  router.post('/servers/:name/disconnect', async (req, res) => {
    try {
      const { name } = req.params;
      await hubServer.disconnectServer(name);
      res.json({ success: true, message: `Server ${name} disconnected` });
    } catch (error) {
      logger.error(`[API] Failed to disconnect server ${req.params.name}:`, error);
      res.status(500).json({ 
        error: 'Failed to disconnect server',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * POST /api/servers/connect-all - Connect all enabled servers
   */
  router.post('/servers/connect-all', async (_req, res) => {
    try {
      await hubServer.connectAllServers();
      res.json({ success: true, message: 'All enabled servers connected' });
    } catch (error) {
      logger.error('[API] Failed to connect all servers:', error);
      res.status(500).json({ error: 'Failed to connect all servers' });
    }
  });

  /**
   * POST /api/servers/disconnect-all - Disconnect all servers
   */
  router.post('/servers/disconnect-all', async (_req, res) => {
    try {
      await hubServer.disconnectAllServers();
      res.json({ success: true, message: 'All servers disconnected' });
    } catch (error) {
      logger.error('[API] Failed to disconnect all servers:', error);
      res.status(500).json({ error: 'Failed to disconnect all servers' });
    }
  });

  /**
   * GET /api/tools - Get all available tools
   */
  router.get('/tools', async (_req, res) => {
    try {
      const result = await hubServer.listTools();
      res.json({ tools: result.tools });
    } catch (error) {
      logger.error('[API] Failed to get tools:', error);
      res.status(500).json({ error: 'Failed to get tools' });
    }
  });

  /**
   * GET /api/analytics - Get usage analytics
   */
  router.get('/analytics', async (_req, res) => {
    try {
      const analytics = await hubServer.getAnalytics();
      res.json({ analytics });
    } catch (error) {
      logger.error('[API] Failed to get analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  });

  /**
   * GET /api/logs - Get recent logs
   */
  router.get('/logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await hubServer.getRecentLogs(limit);
      res.json({ logs });
    } catch (error) {
      logger.error('[API] Failed to get logs:', error);
      res.status(500).json({ error: 'Failed to get logs' });
    }
  });

  /**
   * GET /api/docs/:server - Get documentation for a server
   */
  router.get('/docs/:server', async (req, res) => {
    try {
      const { server } = req.params;
      const docs = await hubServer.getServerDocs(server);
      res.json({ docs });
    } catch (error) {
      logger.error(`[API] Failed to get docs for ${req.params.server}:`, error);
      res.status(500).json({ error: 'Failed to get documentation' });
    }
  });

  return router;
}
