# Multi-Client Connection Guide

**Goal**: Connect multiple AI assistants to your GameDev MCP Hub simultaneously

---

## Architecture Overview

```
┌─────────────────┐
│  Claude Desktop │───┐
└─────────────────┘   │
                      │    ┌──────────────┐     ┌──────────────┐
┌─────────────────┐   ├───→│  MCP Hub     │────→│  Obsidian    │
│  Factory (me!)  │───┤    │  (Port 3000) │     │  Blender     │
└─────────────────┘   │    └──────────────┘     │  GitHub      │
                      │                          │  Godot       │
┌─────────────────┐   │                          └──────────────┘
│   Local LLM     │───┘
└─────────────────┘
```

**How it works**:
- Hub runs on **SSE transport** (port 3000) for MCP clients
- Hub runs **GUI** (port 3100) for monitoring
- All clients connect to hub, hub connects to servers
- No conflicts, no duplicate connections

---

## Current Status

**Right now**: Hub uses stdio (single client only)

**What we need**: Add SSE transport for multiple clients

**The fix**: I'm adding SSE support now!

---

## Connection Methods

### Method 1: SSE (Server-Sent Events) - RECOMMENDED
- **Port**: 3000
- **Multiple clients**: ✅ Yes
- **Best for**: Claude Desktop, Factory, Local LLMs
- **URL**: `http://localhost:3000/sse`

### Method 2: stdio (Standard Input/Output)
- **Port**: N/A (stdin/stdout)
- **Multiple clients**: ❌ No (single process)
- **Best for**: Direct CLI usage
- **Usage**: `npm start` (default)

---

## Client Setup Guides

### 1. Claude Desktop

**Config file**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000/sse"
      }
    }
  }
}
```

**Steps**:
1. Open Claude Desktop
2. Settings → Developer → Edit Config
3. Add the configuration above
4. Restart Claude Desktop
5. Check MCP tools icon - should see ~100 tools!

---

### 2. Factory (Droid/Me)

**Config file**: Create `mcp.json` in your project root:

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "transport": {
        "type": "sse",
        "url": "http://localhost:3000/sse"
      }
    }
  }
}
```

**Or** in Factory settings (if supported):
- Add MCP server
- Type: SSE
- URL: `http://localhost:3000/sse`

**Test connection**:
```javascript
// In Factory, try calling a tool
await mcp.callTool("obsidian__list_notes", {});
```

---

### 3. Local LLM (Open WebUI, Jan, etc.)

**For Open WebUI**:
1. Settings → Connections → MCP Servers
2. Add new server:
   - Name: `gamedev-hub`
   - Type: `SSE`
   - URL: `http://localhost:3000/sse`
3. Save and test

**For Jan.ai**:
1. Settings → Advanced → Extensions
2. Add MCP extension
3. Configure:
   ```json
   {
     "type": "sse",
     "url": "http://localhost:3000/sse"
   }
   ```

**For LM Studio**:
- Currently investigating MCP support
- May need custom integration

**For Ollama with MCP client**:
```bash
# Use mcp-client-cli
npx @modelcontextprotocol/client http://localhost:3000/sse
```

---

## Starting the Hub for Multiple Clients

### Current (stdio only):
```bash
npm start
```

### NEW (SSE for multiple clients):
```bash
npm run start:sse
```

**Or** add to `package.json`:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:sse": "node dist/index-sse.js"
  }
}
```

---

## Monitoring Connections

### GUI Dashboard (Port 3100)

Open: `http://localhost:3100`

**New "CLIENTS" tab** will show:
```
CONNECTED CLIENTS (3)

┌─────────────────────────────────────┐
│ Claude Desktop                      │
│ Connected: 2 minutes ago            │
│ Tools used: 5                       │
│ Status: Active                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Factory Droid                       │
│ Connected: 5 seconds ago            │
│ Tools used: 0                       │
│ Status: Active                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Local LLM (Open WebUI)              │
│ Connected: 1 hour ago               │
│ Tools used: 23                      │
│ Status: Active                      │
└─────────────────────────────────────┘
```

---

## Testing Multi-Client Setup

### Step 1: Start Hub
```bash
npm run start:sse
```

### Step 2: Connect Claude Desktop
1. Configure as shown above
2. Restart Claude
3. Check GUI → CLIENTS tab
4. Should see "Claude Desktop" connected

### Step 3: Connect Factory
1. Configure mcp.json
2. Refresh Factory
3. Check GUI → should show 2 clients

### Step 4: Connect Local LLM
1. Configure your LLM's MCP settings
2. Check GUI → should show 3 clients

### Step 5: Test All Clients
- **Claude Desktop**: Ask "List my Obsidian notes"
- **Factory**: Call `obsidian__list_notes`
- **Local LLM**: Query "Show me GitHub repos"

**All should work simultaneously!**

---

## Troubleshooting

### Client Can't Connect

**Check**:
1. Hub is running: `npm run start:sse`
2. Port 3000 is open: `netstat -ano | findstr 3000`
3. URL is correct: `http://localhost:3000/sse`
4. No firewall blocking

**Test manually**:
```bash
curl http://localhost:3000/sse
```

Should return SSE stream.

### Tools Not Showing

**Check**:
1. Servers are connected (GUI → SERVERS tab)
2. Client MCP config is correct
3. Client restarted after config change
4. Check hub logs: `logs/hub.log`

### Multiple Clients Conflict

**This should NOT happen** with SSE transport. If it does:
1. Check each client using SSE (not stdio)
2. Verify different client IDs
3. Check hub logs for errors

---

## Implementation Status

**Phase 1: SSE Transport** (NEXT)
- [ ] Add SSE transport to hub
- [ ] Add client tracking
- [ ] Add CLIENTS tab to GUI
- [ ] Test with 2+ clients

**Phase 2: Client Management** (AFTER)
- [ ] Show client activity
- [ ] Client disconnect button
- [ ] Client reconnection handling
- [ ] Usage per client

**Phase 3: Advanced** (FUTURE)
- [ ] Client authentication
- [ ] Rate limiting per client
- [ ] Client permissions
- [ ] Custom client names

---

## Quick Setup Commands

**Clone and setup for SSE**:
```bash
cd gamedev-mcp-hub
npm install
npm run build
npm run start:sse
```

**Configure Claude Desktop**:
```powershell
# Edit config
notepad "$env:APPDATA\Claude\claude_desktop_config.json"

# Add gamedev-hub SSE config
# Restart Claude
```

**Open GUI**:
```bash
start http://localhost:3100
```

---

## Next Steps

1. **I'll implement SSE transport** (give me 5 minutes)
2. **Add CLIENTS tab to GUI**
3. **Create start:sse script**
4. **You test with Claude Desktop**
5. **We add Factory connection**
6. **We add your local LLM**

**Ready to proceed?** Say yes and I'll add SSE support now! 🚀
