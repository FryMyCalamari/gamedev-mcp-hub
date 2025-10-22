# 🎯 LM STUDIO MCP - THE CORRECT WAY

## I WAS WRONG! Here's the Reality

**LM Studio v0.3.17+ is an MCP HOST**, not a client!

This means:
- LM Studio connects TO MCP servers
- Your hub IS an MCP server
- But LM Studio can't connect to remote SSE endpoints yet
- It only supports `npx` and `uvx` local MCP servers

---

## How LM Studio MCP Actually Works

### LM Studio as MCP Host

**Configuration file**: `~/.lmstudio/mcp.json` (or `%USERPROFILE%/.lmstudio/mcp.json` on Windows)

**Supported MCP Server Types**:
1. **Local via `npx`**: Node.js packages
2. **Local via `uvx`**: Python packages  
3. **Remote HTTP**: MCP servers with HTTP endpoints

**Example `mcp.json`**:
```json
{
  "mcpServers": {
    "huggingface": {
      "url": "https://huggingface.co/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_HF_TOKEN>"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

---

## Your GameDev Hub + LM Studio

### The Problem

**Your hub serves on**: `http://localhost:3000/sse`  
**LM Studio expects**: Local commands (`npx`, `uvx`) or specific HTTP formats

**Current situation**: Your hub is an SSE server, but LM Studio's MCP implementation may not support SSE transport yet!

### The Solution: Create a Wrapper

Make your hub installable as an `npx` MCP server!

**Create**: `package.json` in your hub root:
```json
{
  "name": "gamedev-mcp-hub-client",
  "version": "1.0.0",
  "bin": {
    "gamedev-mcp-hub": "./dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4"
  }
}
```

**Then LM Studio can use**:
```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index.js"]
    }
  }
}
```

---

## Correct LM Studio MCP Configuration

### Your `mcp.json` Location

**Windows**: `C:\Users\alter\.lmstudio\mcp.json`

**Mac/Linux**: `~/.lmstudio/mcp.json`

### How to Edit

**Option 1 - In LM Studio**:
1. Open LM Studio
2. Go to "Program" tab (right sidebar)
3. Click "Install > Edit mcp.json"
4. Add your hub configuration

**Option 2 - Direct File Edit**:
```powershell
notepad C:\Users\alter\.lmstudio\mcp.json
```

### Add Your GameDev Hub

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": [
        "D:\\Power\\gamedev-mcp-hub\\dist\\index.js"
      ],
      "env": {}
    }
  }
}
```

**NOTE**: This uses stdio transport, not SSE!

---

## The REAL Architecture

```
┌──────────────────┐
│   LM Studio      │
│  (MCP Host)      │
│  mcp.json        │
└────────┬─────────┘
         │ Spawns processes via npx/uvx/node
         │
    ┌────┴────┬────────┬────────────┐
    ↓         ↓        ↓            ↓
┌────────┐┌────────┐┌────────┐┌──────────┐
│ GitHub ││  HF    ││ Stripe ││Your Hub  │
│  npx   ││  HTTP  ││  npx   ││  node    │
└────────┘└────────┘└────────┘└──────────┘
   (MCP     (MCP      (MCP       (Your
   Server)  Server)   Server)    MCP Server)
```

**Each MCP server runs in its own process!**

---

## What You Need To Do

### Step 1: Make Your Hub an MCP Server

Your hub is already built for this! It implements the MCP protocol.

**Test**: Does `node dist/index.js` start your hub?

### Step 2: Add to LM Studio's mcp.json

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Step 3: Restart LM Studio

LM Studio auto-loads MCP servers when you save `mcp.json`.

### Step 4: Test in Chat

1. Start a chat in LM Studio
2. Ask: "List available tools"
3. Should see your 75 gamedev tools!
4. Try: "Search my Obsidian for game design"

---

## SSE vs stdio Transport

### Your Hub's Current Setup

**SSE Mode** (`index-sse.ts`):
- Runs HTTP server on port 3000
- Multiple clients via `/sse` endpoint
- Good for: LM Studio as external client

**stdio Mode** (`index.ts`):
- Direct process communication
- Single client via stdin/stdout
- Good for: LM Studio spawning your hub as MCP server

### For LM Studio

**Use stdio mode!** LM Studio spawns the process directly.

**Your current commands**:
- `npm start` → `node dist/index.js` (stdio) ✅ Use this!
- `npm run start:sse` → `node dist/index-sse.js` (SSE) ❌ Don't use for LM Studio

---

## Correct mcp.json for Your Hub

```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": [
        "D:\\Power\\gamedev-mcp-hub\\dist\\index.js"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here",
        "OBSIDIAN_API_KEY": "your_key_here"
      }
    },
    "obsidian-direct": {
      "command": "E:\\Obsidian\\Chase\\.obsidian\\plugins\\mcp-tools\\bin\\mcp-server.exe",
      "args": [],
      "env": {
        "OBSIDIAN_API_KEY": "your-api-key-here",
        "OBSIDIAN_REST_API_URL": "https://127.0.0.1:27124",
        "NODE_TLS_REJECT_UNAUTHORIZED": "0"
      }
    },
    "blender-direct": {
      "command": "uvx",
      "args": ["blender-mcp"],
      "env": {
        "BLENDER_HOST": "localhost",
        "BLENDER_PORT": "9876"
      }
    }
  }
}
```

**Options**:
1. **Use your hub** → All 75 tools via hub routing
2. **Use servers directly** → Each server separate (Obsidian, Blender, etc.)

---

## Testing Your Setup

### Test Hub Starts

```powershell
cd D:\Power\gamedev-mcp-hub
node dist/index.js
```

**Expected**: Hub starts, connects to servers, waits for stdin

### Test from LM Studio

1. Save `mcp.json` with your hub
2. LM Studio auto-loads (check status)
3. Start chat
4. Try tool: "Search Obsidian for AI notes"

---

## Troubleshooting

### "Command not found"

**Problem**: LM Studio can't find `node`

**Fix**: Use full path:
```json
{
  "command": "C:\\Program Files\\nodejs\\node.exe",
  "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index.js"]
}
```

### "MCP server crashed"

**Problem**: Hub can't start (missing deps, port conflicts)

**Fix**: 
1. Test manually: `node dist/index.js`
2. Check logs in `logs/hub.log`
3. Ensure no other hub instance running

### "No tools available"

**Problem**: Hub started but servers not connected

**Fix**: Check hub logs for server connection errors

---

## The Big Picture

### What LM Studio Does

1. Reads `mcp.json`
2. Spawns each MCP server as separate process
3. Communicates via stdio (stdin/stdout)
4. Presents tools to your models
5. Routes tool calls to appropriate server

### What Your Hub Does

1. Starts in stdio mode
2. Connects to downstream servers (Obsidian, Blender, etc.)
3. Receives MCP requests via stdin
4. Routes to correct server
5. Returns results via stdout

---

## Summary

✅ **LM Studio is an MCP Host** (not client)  
✅ **Your hub is an MCP Server** (provides tools)  
✅ **Connection**: LM Studio spawns your hub via `node` command  
✅ **Transport**: stdio (not SSE)  
✅ **Configuration**: `~/.lmstudio/mcp.json`  

**Next**: Add your hub to LM Studio's `mcp.json` and test!

---

## Your Action Items

1. **Find mcp.json**: `C:\Users\alter\.lmstudio\mcp.json`
2. **Add gamedev-hub config** (see above)
3. **Save file** → LM Studio auto-loads
4. **Test in chat** → Ask model to use tools
5. **Enjoy 75 gamedev tools in LM Studio!** 🎮

**That's the CORRECT way!** 🎉
