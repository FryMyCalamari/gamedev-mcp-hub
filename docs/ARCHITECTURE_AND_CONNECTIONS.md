# Architecture and Connection Management

## 🏗️ Hub Architecture

The GameDev MCP Hub uses a **Hub-and-Spoke** (Aggregator/Proxy) pattern:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Desktop │     │   Home LLM      │     │  Other MCP      │
│   (MCP Client)  │     │  (MCP Client)   │     │    Clients      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  GameDev MCP Hub        │
                    │  (MCP Server + Client)  │
                    │                         │
                    │  • Aggregates tools     │
                    │  • Routes requests      │
                    │  • Manages connections  │
                    │  • Provides GUI         │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
         ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
         │  Obsidian    │ │  Blender   │ │  Godot     │
         │ MCP Server   │ │ MCP Server │ │ MCP Server │
         │  (18 tools)  │ │ (17 tools) │ │ (22 tools) │
         └──────────────┘ └────────────┘ └────────────┘
```

## 🔑 Key Architectural Principles

### 1. **Single Hub, Multiple Clients**
- The hub is the **ONLY** process that connects to downstream MCP servers
- All AI clients (Claude Desktop, LLMs, etc.) connect to the hub
- The hub manages all downstream connections internally

### 2. **Stdio Transport = 1:1 Connection**
MCP's stdio transport creates a **one-to-one** relationship:
- **One client** spawns **one server process**
- Multiple clients = multiple server processes spawned
- This is by design for isolation and security

### 3. **Why Hub Pattern?**
Without a hub:
```
❌ PROBLEMATIC: Direct Connections
Claude Desktop ──> Obsidian Server (Process 1)
Home LLM       ──> Obsidian Server (Process 2)
Custom Tool    ──> Obsidian Server (Process 3)

Problems:
- 3x resource usage (3 server processes)
- Potential state conflicts
- No centralized logging/monitoring
- Configuration duplication
```

With hub:
```
✅ CORRECT: Hub Pattern
Claude Desktop ──┐
Home LLM       ──┤──> GameDev Hub ──> Obsidian Server (1 process)
Custom Tool    ──┘
                 
Benefits:
- Single server instance per backend
- Centralized tool routing
- Unified logging & analytics
- Single configuration point
- GUI for monitoring
```

## 🔌 Proper Connection Setup

### For Claude Desktop

**IMPORTANT**: Remove any direct Obsidian/Blender/etc. server configurations from Claude Desktop.

1. **Remove direct server configs** from Claude Desktop config:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`

   Remove entries like:
   ```json
   {
     "mcpServers": {
       "obsidian": {  // ❌ REMOVE THIS
         "command": "E:\\Obsidian\\...\\mcp-server.exe",
         ...
       }
     }
   }
   ```

2. **Add ONLY the hub**:
   ```json
   {
     "mcpServers": {
       "gamedev-hub": {
         "command": "node",
         "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index.js"],
         "env": {
           "NODE_ENV": "production",
           "LOG_LEVEL": "info"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

Now Claude will have access to **all** tools (Obsidian, Blender, Godot, etc.) through the hub!

### For Home-Based LLMs

Depending on your LLM's MCP client capabilities:

#### Option 1: If LLM Supports MCP Stdio Protocol
Configure it like Claude Desktop:
```json
{
  "mcp_servers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index.js"]
    }
  }
}
```

#### Option 2: If LLM Doesn't Support MCP
Use the hub's future HTTP API (planned):
```python
import requests

# Query available tools
tools = requests.get("http://localhost:3100/api/tools").json()

# Execute a tool
result = requests.post("http://localhost:3100/api/execute", json={
    "tool": "obsidian__read-note",
    "args": {"path": "MyNote.md"}
})
```

## 🚨 Common Issues and Solutions

### Issue 1: "Connection closed" errors with Obsidian
**Cause**: Multiple processes trying to spawn the same MCP server

**Solution**: 
- Remove direct Obsidian config from Claude Desktop
- Only connect through the hub

### Issue 2: Tools appearing twice in Claude
**Cause**: Both hub and direct server configured in Claude Desktop

**Solution**:
- Keep ONLY the `gamedev-hub` entry in Claude config
- Remove all other MCP server entries

### Issue 3: Server not connecting
**Cause**: Environment variables not set properly

**Solution**:
```bash
# Check if Obsidian Local REST API is running
# In Obsidian: Settings → Community Plugins → Local REST API → Ensure enabled

# Verify hub config has correct paths
# File: config/mcp-servers.json
```

## 🔧 Configuration Management

### Hub Configuration (`config/mcp-servers.json`)
This is the **ONLY** place where downstream servers are configured:

```json
{
  "servers": {
    "obsidian": {
      "enabled": true,
      "command": "E:\\Obsidian\\Chase\\.obsidian\\plugins\\mcp-tools\\bin\\mcp-server.exe",
      "env": {
        "OBSIDIAN_API_KEY": "your-key",
        "OBSIDIAN_REST_API_URL": "https://127.0.0.1:27124",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    },
    "blender": {
      "enabled": true,
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

### Client Configuration (Claude Desktop, LLMs, etc.)
Clients should **ONLY** know about the hub:

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["path/to/gamedev-mcp-hub/dist/index.js"]
    }
  }
}
```

## 📊 Monitoring Connections

### Web GUI Dashboard
Visit `http://localhost:3100` to:
- See all connected servers
- View available tools
- Monitor connection status
- Check logs

### Command Line
```bash
# Check hub logs
tail -f logs/hub.log

# Check specific server status
# (Future feature - will add CLI commands)
```

## 🔮 Future Enhancements

### Planned Features:
1. **HTTP API**: REST endpoints for non-MCP clients
2. **WebSocket API**: Real-time bidirectional communication
3. **Multi-client Management**: Track which client is using which tools
4. **Rate Limiting**: Per-client request throttling
5. **Authentication**: API keys for external access
6. **Tool Permissions**: Fine-grained access control per client

### Potential Use Cases:
- Web UI for tool execution
- Discord bot using game dev tools
- CI/CD pipeline integration
- Custom automation scripts
- Multi-tenant access with permissions

## 📝 Best Practices

### ✅ DO:
- Configure all downstream servers in the hub's config
- Connect all clients to the hub
- Use the GUI to monitor connections
- Check logs when troubleshooting
- Keep hub config in version control (excluding secrets)

### ❌ DON'T:
- Configure individual servers in multiple places
- Connect clients directly to downstream servers
- Run multiple hub instances (for now)
- Expose hub to network without authentication (future feature)
- Share API keys in config files (use environment variables)

## 🔒 Security Considerations

### Current Architecture:
- Hub runs locally (127.0.0.1)
- Stdio transport is local-only
- No network exposure by default
- GUI bound to localhost

### When Exposing to Network (Future):
- Require API authentication
- Use HTTPS for web interface
- Implement rate limiting
- Add IP whitelisting
- Audit all tool executions

## 📚 Additional Resources

- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Claude Desktop MCP Setup](https://docs.anthropic.com/claude/docs/mcp)
- [GUI Documentation](./GUI.md)
- [Obsidian Integration](./OBSIDIAN_INTEGRATION.md)
- [Blender Integration](./BLENDER_INTEGRATION.md)

## 🤝 Contributing

If you're extending the hub with new connection types:
1. Follow the existing adapter pattern
2. Add proper error handling
3. Document connection requirements
4. Update this architecture guide
5. Add tests for the new connection type

---

**Summary**: The GameDev MCP Hub is designed as a **single point of entry** for all AI clients. Configure your servers once in the hub, then all clients connect to the hub. This eliminates connection conflicts, reduces resource usage, and provides centralized monitoring.
