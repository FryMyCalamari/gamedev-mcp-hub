# LM Studio + GameDev MCP Hub Setup Guide

**Connect your local LLM (LM Studio) to the GameDev MCP Hub**

---

## Overview

LM Studio can connect to MCP servers and use all your hub tools (~100 tools from 5 servers)!

```
┌─────────────┐
│  LM Studio  │
│  (Local AI) │
└──────┬──────┘
       │
       ├──→ http://localhost:3000/sse (MCP endpoint)
       │
   ┌───▼──────────┐     ┌─────────────┐
   │   MCP HUB    │────→│  obsidian   │
   │  Port 3000   │     │  blender    │
   └──────────────┘     │  github     │
                        │  godot      │
                        │  thingiverse│
                        └─────────────┘
```

---

## Prerequisites

1. **LM Studio installed** - https://lmstudio.ai/
2. **GameDev MCP Hub running** - This hub
3. **Model loaded in LM Studio** - Any model works

---

## Step 1: Check LM Studio MCP Support

**LM Studio version**: Check Settings → About

**MCP Support**: 
- **v0.2.9+**: Native MCP support via Extensions
- **Earlier**: May need manual configuration

---

## Step 2: Start the Hub (SSE Mode)

Open PowerShell in hub directory:

```powershell
cd D:\Power\gamedev-mcp-hub
npm run start:sse
```

**Expected output**:
```
GameDev MCP Hub (SSE) listening on port 3000
MCP endpoint: http://localhost:3000/sse
GUI: http://localhost:3100
Downstream servers: 4
Multiple clients can now connect simultaneously!
```

**Keep this terminal open!**

---

## Step 3: Configure LM Studio

### Method A: Using LM Studio MCP Extension (v0.2.9+)

1. **Open LM Studio**
2. **Go to**: Developer → Extensions (or Settings → Extensions)
3. **Find**: "MCP Server" or "Model Context Protocol"
4. **Click**: Enable/Install
5. **Configure**:
   ```json
   {
     "servers": {
       "gamedev-hub": {
         "url": "http://localhost:3000/sse",
         "name": "GameDev MCP Hub",
         "enabled": true
       }
     }
   }
   ```
6. **Restart** LM Studio

### Method B: Using Config File (if Method A not available)

**Config location**: 
- Windows: `%USERPROFILE%\.lmstudio\mcp_config.json`
- macOS: `~/.lmstudio/mcp_config.json`
- Linux: `~/.lmstudio/mcp_config.json`

**Create/edit** `mcp_config.json`:
```json
{
  "mcpServers": {
    "gamedev-hub": {
      "url": "http://localhost:3000/sse",
      "transport": "sse",
      "name": "GameDev MCP Hub",
      "description": "Access to game development tools and servers"
    }
  }
}
```

**Restart LM Studio**

### Method C: Using LM Studio CLI (Advanced)

If LM Studio supports CLI MCP client:

```bash
lms mcp connect http://localhost:3000/sse
```

---

## Step 4: Verify Connection

### In LM Studio

1. **Start a chat** with any model
2. **Look for**: MCP tools icon or indicator
3. **Check**: Should show "GameDev MCP Hub" connected
4. **Tools available**: Should list ~100 tools

### Test Query

Type in LM Studio chat:
```
Can you list the available MCP tools from gamedev-hub?
```

**Expected**: Should list obsidian, blender, github, godot tools

### Alternative: Check Hub Logs

```powershell
Get-Content D:\Power\gamedev-mcp-hub\logs\hub.log | Select-String "SSE"
```

**Should show**:
```
[SSE] New client connecting: LM Studio (client-...)
[SSE] Client connected successfully
```

---

## Step 5: Test Tools

### Test 1: List Obsidian Notes

In LM Studio chat:
```
Using the obsidian tools, can you list my recent notes?
```

### Test 2: GitHub Search

```
Search my GitHub repositories for projects related to game development
```

### Test 3: Blender Operations

```
Show me what Blender operations are available through the hub
```

---

## Current LM Studio MCP Status

**As of October 2024**:
- LM Studio is actively adding MCP support
- May be in beta/experimental
- Check latest docs: https://lmstudio.ai/docs

**If MCP not available yet**:
- Use Claude Desktop instead (full MCP support)
- Or wait for LM Studio update
- Or use MCP client wrapper (see Method D below)

---

## Method D: MCP Client Wrapper (If LM Studio Doesn't Support MCP Yet)

If LM Studio doesn't have native MCP support, use a wrapper:

### Install MCP Client CLI

```bash
npm install -g @modelcontextprotocol/client-cli
```

### Connect to Hub

```bash
mcp-client http://localhost:3000/sse
```

### Use as Proxy

This creates a local API that LM Studio can call. Configure LM Studio to use this proxy for tool calls.

**Advanced**: Requires custom function calling setup in LM Studio.

---

## Troubleshooting

### LM Studio Can't Find MCP Options

**Problem**: No MCP settings in LM Studio

**Solutions**:
1. **Update LM Studio** to latest version
2. **Check beta features** in settings
3. **Enable developer mode** if available
4. **Use Claude Desktop** as alternative (native MCP)

### Connection Refused

**Check**:
1. Hub is running: `curl http://localhost:3000/health`
2. Port 3000 is open: `netstat -ano | findstr 3000`
3. No firewall blocking
4. URL is correct: `http://localhost:3000/sse`

### Tools Not Showing

**Verify**:
1. **Hub has servers**: Check GUI at http://localhost:3100
2. **Servers connected**: Should show 4-5 servers
3. **Tools loaded**: TOOLS tab should show ~100 tools
4. **LM Studio sees connection**: Check MCP status in UI

### Model Not Using Tools

**Check**:
1. **Model supports function calling**: Not all models do
2. **Tool use is enabled**: Check LM Studio settings
3. **Prompt model explicitly**: "Use the available tools to..."

---

## Recommended Models for MCP/Tool Use

**Best models in LM Studio for tool calling**:
1. **Mistral 7B Instruct v0.3** - Good tool use
2. **Mixtral 8x7B Instruct** - Excellent reasoning
3. **CodeLlama 34B Instruct** - Great for dev tools
4. **Llama 3 8B/70B Instruct** - Strong function calling
5. **Qwen 2.5 7B/14B** - Good tool understanding

**Download in LM Studio**: Search tab → Download model

---

## Alternative: Use Claude Desktop (Recommended)

If LM Studio MCP support isn't ready:

**Claude Desktop has full MCP support!**

1. Install Claude Desktop
2. Configure: `%APPDATA%\Claude\claude_desktop_config.json`
   ```json
   {
     "mcpServers": {
       "gamedev-hub": {
         "command": "node",
         "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index-sse.js"]
       }
     }
   }
   ```
3. Restart Claude Desktop
4. All tools available immediately!

---

## Hub Status Dashboard

**While testing, monitor**:

**GUI**: http://localhost:3100
- See connected servers
- See connected clients (you!)
- View tools list
- Check logs

**Health API**: http://localhost:3000/health
- Server count
- Client count
- Hub status

**Clients API**: http://localhost:3000/api/clients
- Who's connected
- Connection duration
- Tools used

---

## Example LM Studio Prompts

Once connected, try these:

### Game Development Workflow
```
I'm working on a Unity game. Can you:
1. Search my Obsidian notes for "game design" 
2. Find related code in my GitHub repos
3. List any 3D models in my Blender files
```

### Asset Management
```
Help me organize my game assets:
1. Check what's in my Godot project
2. Search Thingiverse for "game character" models
3. Document the findings in Obsidian
```

### Code Review
```
Using GitHub tools, review my latest commits in the 
"gamedev-mcp-hub" repository and suggest improvements
```

---

## What You Get

**With LM Studio connected to hub**:
- ✅ ~100 tools available
- ✅ 5 game dev servers accessible
- ✅ Local AI (private, offline)
- ✅ No API costs
- ✅ Full control

**Servers you can use**:
- Obsidian (knowledge management)
- Blender (3D modeling)
- GitHub (version control)
- Godot (game engine)
- Thingiverse (3D models)

---

## Next Steps

1. ✅ **Start hub**: `npm run start:sse`
2. ⬜ **Configure LM Studio**: Add MCP server
3. ⬜ **Load a model**: Good function-calling model
4. ⬜ **Test connection**: Try listing tools
5. ⬜ **Use it!**: Build your game with AI assistance

---

## Quick Commands

**Start hub**:
```powershell
cd D:\Power\gamedev-mcp-hub
npm run start:sse
```

**Test hub**:
```powershell
curl http://localhost:3000/health
```

**View logs**:
```powershell
Get-Content logs\hub.log -Tail 20 -Wait
```

**Open GUI**:
```powershell
start http://localhost:3100
```

---

**Need help?** Check:
- LM Studio docs: https://lmstudio.ai/docs
- This hub's GUI: http://localhost:3100
- Hub logs: `logs/hub.log`

**Ready to start?** Run `npm run start:sse` and configure LM Studio! 🚀
