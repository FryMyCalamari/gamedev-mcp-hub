# 🎮 GameDev MCP Hub - GUI Dashboard

A retro-inspired web interface for managing and monitoring your MCP server connections.

## 🌟 Features

- **🔌 Server Management**: View all MCP server connections with real-time status updates
- **⚡ Manual Control**: Connect and disconnect servers with one click
- **📝 Live Logs**: Stream logs in real-time with filtering and search capabilities
- **📊 Analytics**: View usage statistics, performance metrics, and tool usage data
- **📖 Documentation**: Browse documentation and available tools for each MCP server
- **🎨 Theme Toggle**: Switch between dark and light themes (hacker-inspired 16-bit aesthetic)
- **🔄 Real-time Updates**: WebSocket-powered live updates for server status and logs

## 🚀 Quick Start

### 1. Enable GUI Server

The GUI is enabled by default in `config/hub-config.json`:

```json
{
  "features": {
    "rest_api": true,
    "websocket": true
  }
}
```

### 2. Start the Hub

```bash
npm run build
npm start
```

The GUI will be available at: **http://localhost:3100**

### 3. Access the Dashboard

Open your browser and navigate to `http://localhost:3100`

## 🖥️ Interface Overview

### Header
- **Connection Status**: Real-time WebSocket connection indicator
- **Theme Toggle**: Switch between dark/light modes (🌙/☀️)
- **Version Badge**: Current hub version

### Control Panel
- **Connect All**: Connect all enabled MCP servers
- **Disconnect All**: Disconnect all active servers
- **Status Summary**: Shows connected/total servers count

### Tabs

#### 🔌 SERVERS Tab
- Grid view of all configured MCP servers
- Real-time status indicators (Connected/Disconnected/Error)
- Tool count per server
- Individual connect/disconnect buttons
- Color-coded borders based on status

#### 📝 LOGS Tab
- **Live Log Stream**: Real-time log entries from all servers
- **Filters**:
  - Log Level: ALL, DEBUG, INFO, WARN, ERROR
  - Server Filter: View logs from specific servers
  - Search: Text search across log messages
- **Controls**:
  - Auto-scroll toggle
  - Clear logs
  - Export logs to file
- Color-coded log levels for easy scanning

#### 📊 ANALYTICS Tab
- **Summary Cards**:
  - Total Calls
  - Average Latency
  - Total Tokens
  - Error Rate
- **Calls by Server**: Bar chart visualization
- **Top Tools Table**: Most frequently used tools ranked by usage

#### 📖 DOCS Tab
- **Server List**: Browse all configured servers
- **Server Details**:
  - Description and category
  - Links to repository and documentation
  - Complete list of available tools with descriptions
  - Input schemas for each tool

## 🎨 Design & Aesthetics

### Theme System
- **Dark Theme**: Hacker-inspired terminal aesthetic with neon green accents
- **Light Theme**: Clean, high-contrast version for daytime use
- **Fonts**: 
  - Headers: "Press Start 2P" (pixel font)
  - Body: "VT323" (retro terminal font)

### Visual Style
- 16-bit inspired borders and buttons
- Scanline overlay effect (subtle)
- Glowing text shadows on active elements
- Smooth animations and transitions
- Retro color palette with modern usability

## 🔒 Security

### Current Implementation (Local Use Only)

The GUI server is designed for **localhost access only**:

```typescript
// Binds to 127.0.0.1 only
this.httpServer = this.app.listen(3100, '127.0.0.1', () => {
  logger.info('[GUI] Server running on http://127.0.0.1:3100');
});
```

**Security Features for Local Use:**
- Bound to localhost (127.0.0.1) - not accessible from network
- CORS restricted to localhost origin
- No sensitive data exposed (API keys are encrypted)

### ⚠️ Production Deployment Requirements

If you need to expose this GUI to a network or production environment, you **MUST** add:

1. **Authentication**:
   - JWT tokens
   - OAuth 2.0
   - API key authentication
   
2. **HTTPS/TLS**:
   - SSL certificate
   - Encrypted connections
   
3. **Rate Limiting**:
   - Per-client request limits
   - DDoS protection
   
4. **Input Validation**:
   - Sanitize all user inputs
   - Validate API requests
   
5. **CSP Headers**:
   - Content Security Policy
   - XSS protection
   
6. **Audit Logging**:
   - Log all access attempts
   - Track user actions

**Example production configuration** (not implemented):
```json
{
  "security": {
    "require_authentication": true,
    "auth_method": "jwt",
    "https_enabled": true,
    "rate_limiting": {
      "enabled": true,
      "max_requests_per_minute": 60
    }
  }
}
```

## 🔌 WebSocket Protocol

### Client → Server Events

```javascript
{
  "type": "ping",
  "data": {}
}
```

### Server → Client Events

```javascript
// Initial data on connection
{
  "type": "initial-data",
  "data": {
    "servers": [...],
    "analytics": {...}
  }
}

// Server status update (periodic)
{
  "type": "server-status-update",
  "data": {
    "servers": [...]
  }
}

// Individual server status change
{
  "type": "server-status-changed",
  "data": {
    "serverName": "blender",
    "status": "connected"
  }
}

// New log entry
{
  "type": "log-entry",
  "data": {
    "timestamp": "2025-01-21T10:30:00Z",
    "level": "info",
    "message": "Server connected"
  }
}

// Analytics update
{
  "type": "analytics-update",
  "data": {...}
}
```

## 🛠️ REST API Endpoints

### Servers
- `GET /api/servers` - Get all server statuses
- `POST /api/servers/:name/connect` - Connect a server
- `POST /api/servers/:name/disconnect` - Disconnect a server
- `POST /api/servers/connect-all` - Connect all enabled servers
- `POST /api/servers/disconnect-all` - Disconnect all servers

### Tools & Analytics
- `GET /api/tools` - Get all available tools
- `GET /api/analytics` - Get usage analytics

### Logs & Documentation
- `GET /api/logs?limit=100` - Get recent logs
- `GET /api/docs/:server` - Get server documentation

### Health Check
- `GET /health` - Server health status

## 📊 Performance

### WebSocket Updates
- Server status updates: Every 2 seconds
- Keepalive ping: Every 30 seconds
- Automatic reconnection on disconnect

### Log Management
- Maximum log history: 1000 entries (in-memory)
- Frontend display limit: 500 entries
- Real-time streaming with auto-scroll

### Resource Usage
- Minimal CPU overhead (~1-2% idle)
- Low memory footprint (~50MB)
- WebSocket connections: Lightweight, persistent

## 🎯 Use Cases

### Development Workflow
1. Start the hub with GUI enabled
2. Open dashboard in browser
3. Monitor server connections while developing
4. View real-time logs for debugging
5. Manually connect/disconnect servers for testing

### Troubleshooting
1. Check server status in real-time
2. View error logs instantly
3. Identify failing connections
4. Monitor tool usage and performance
5. Export logs for further analysis

### Demonstrations
1. Visual showcase of MCP hub capabilities
2. Live demonstration of server management
3. Educational tool for understanding MCP architecture

## 🔧 Customization

### Port Configuration
Change the GUI port in `src/gui/gui-server.ts`:
```typescript
const guiServer = new GuiServer(hubServer, 3100); // Change 3100 to your port
```

### Theme Colors
Edit CSS variables in `src/gui/public/styles.css`:
```css
:root[data-theme="dark"] {
  --text-primary: #00ff41;    /* Change primary color */
  --bg-primary: #0a0e27;      /* Change background */
  /* ... */
}
```

### Log Retention
Adjust log history size in `src/utils/logger.ts`:
```typescript
private maxHistorySize: number = 1000; // Change to your limit
```

## 🐛 Troubleshooting

### GUI won't start
1. Check `config/hub-config.json` - ensure `rest_api: true`
2. Verify port 3100 is not in use
3. Check logs in `logs/hub.log`

### WebSocket connection fails
1. Check firewall settings for localhost
2. Ensure browser supports WebSocket
3. Try disabling browser extensions

### Logs not appearing
1. Verify log level filter settings
2. Check if logs are being generated
3. Try clearing and refreshing logs

### Server controls not working
1. Check server configuration in `config/mcp-servers.json`
2. Verify server paths and commands are correct
3. Check console for API errors

## 📝 Future Enhancements

- [ ] User authentication system
- [ ] HTTPS/TLS support
- [ ] Advanced filtering and log analysis
- [ ] Export analytics to CSV/JSON
- [ ] Server configuration editor
- [ ] Real-time performance graphs
- [ ] Mobile-responsive design improvements
- [ ] Dark/light theme auto-detection
- [ ] Customizable dashboard layouts

## 🤝 Contributing

Want to improve the GUI? Here's how:

1. Fork the repository
2. Create a feature branch
3. Make your changes in `src/gui/`
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Same as the main project

---

**Built with ❤️ for the game development community**
