# 🤖 LM Studio Integration Guide

## Overview

LM Studio provides an **OpenAI-compatible API** at `http://localhost:1234` that your hub can connect to via SSE (Server-Sent Events).

**Your Hub SSE Endpoint**: `http://localhost:3000/sse`

---

## Current Hub Status

✅ **Hub is running** on port 3000 (SSE mode)  
✅ **4 servers connected**: Obsidian, Blender, Godot, GitHub  
✅ **75 tools available**  
✅ **Client tracking enabled** (Factory Droid detected)

**Failing**: Meshy (Python path issue), Sentry (uvx not working properly)

---

## Your LM Studio Setup

### Available Models

From your LM Studio at `http://127.0.0.1:1234`:

1. **openai/gpt-oss-20b** - 20B parameter model
2. **qwen/qwen3-coder-30b** - 30B coding model  
3. **Other models** (check full list below)

### LM Studio API Endpoints

**Base URL**: `http://localhost:1234/v1`

**Endpoints**:
- `GET /v1/models` - List available models
- `POST /v1/chat/completions` - Chat with models
- `POST /v1/completions` - Text completion
- `POST /v1/embeddings` - Generate embeddings
- `POST /v1/responses` - Stateful interactions (NEW!)

---

## How to Connect LM Studio to Your Hub

### Method 1: Direct MCP Client (Recommended)

LM Studio can act as an MCP client and connect to your hub's SSE endpoint.

**Configuration**:
```json
{
  "mcpServers": {
    "gamedev-hub": {
      "url": "http://localhost:3000/sse",
      "transport": "sse"
    }
  }
}
```

**Where to add this**:
- LM Studio doesn't have built-in MCP client support yet
- You'd need to use a proxy or wrapper

### Method 2: Via Python SDK

Use LM Studio's Python SDK to connect programmatically:

```python
from lmstudio import LMStudioClient
import requests

# Connect to LM Studio
client = LMStudioClient(base_url="http://localhost:1234/v1")

# Connect to your hub
hub_url = "http://localhost:3000/sse"
# Send SSE request with client headers
```

### Method 3: Use MCP-Compatible Client

Use an AI client that supports MCP (like Claude Desktop, Cursor, etc.) and configure it to connect to your hub:

```
MCP Server URL: http://localhost:3000/sse
```

---

## Testing Connection

### Test Hub Availability

```powershell
# Check if hub is running
Invoke-WebRequest http://localhost:3000/health

# Check connected clients
Invoke-WebRequest http://localhost:3000/api/clients

# Test SSE endpoint (keeps connection open)
curl http://localhost:3000/sse
```

### Test LM Studio

```powershell
# List models
curl http://localhost:1234/v1/models

# Test chat
curl http://localhost:1234/v1/chat/completions `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"model":"openai/gpt-oss-20b","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}'
```

---

## Hub-to-LM-Studio Architecture

```
[LM Studio Server]              [Your Hub]
http://localhost:1234     →     http://localhost:3000/sse
   (OpenAI API)                    (MCP SSE Endpoint)
                                         ↓
                                   [Downstream Servers]
                                    • Obsidian (18 tools)
                                    • Blender (17 tools)
                                    • Godot (14 tools)
                                    • GitHub (26 tools)
                                         ↓
                                   [AI Client Tools]
```

**Flow**:
1. LM Studio model receives user request
2. Model decides to use a tool
3. Connects to hub via SSE
4. Hub routes to appropriate server
5. Results return to LM Studio
6. LM Studio generates response

---

## LM Studio Models Documentation

### openai/gpt-oss-20b

**Type**: General purpose 20B model  
**Best for**: Balanced performance and speed  
**Context**: Depends on quantization  
**Recommended for**: General game dev tasks

### qwen/qwen3-coder-30b

**Type**: Code-specialized 30B model  
**Best for**: Programming, debugging, code generation  
**Context**: Large context window  
**Recommended for**: Complex coding tasks, refactoring

---

## MCP Client Configuration

### For MCP-Compatible Clients

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "gamedev-hub": {
      "command": "node",
      "args": ["D:\\Power\\gamedev-mcp-hub\\dist\\index-sse.js"],
      "transport": "sse",
      "url": "http://localhost:3000/sse"
    }
  }
}
```

**Cursor** (Settings → MCP Servers):
```
Name: GameDev Hub
URL: http://localhost:3000/sse
Transport: SSE
```

---

## Custom LM Studio Integration Script

Create a bridge script to connect LM Studio to your hub:

```javascript
// lm-studio-mcp-bridge.js
import { EventSource } from 'eventsource';
import fetch from 'node-fetch';

const HUB_URL = 'http://localhost:3000/sse';
const LM_STUDIO_URL = 'http://localhost:1234/v1';

// Connect to hub via SSE
const eventSource = new EventSource(HUB_URL, {
  headers: {
    'x-client-id': 'lm-studio',
    'x-client-name': 'LM Studio'
  }
});

eventSource.onmessage = (event) => {
  console.log('Hub message:', event.data);
};

// Call tool via hub
async function callHubTool(toolName, args) {
  const response = await fetch('http://localhost:3000/api/tool/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toolName, args })
  });
  return response.json();
}

// Example: Call Obsidian search
const result = await callHubTool('obsidian__search_notes', {
  query: 'game design'
});
console.log(result);
```

---

## Environment Setup

### Start Both Services

**Terminal 1 - Start Hub**:
```powershell
cd D:\Power\gamedev-mcp-hub
start-gui-with-browser.bat
```

**Terminal 2 - Start LM Studio**:
- Open LM Studio app
- Go to Local Server tab
- Click "Start Server"
- Server starts on port 1234

**Verify**:
```powershell
# Hub running?
curl http://localhost:3000/health

# LM Studio running?
curl http://localhost:1234/v1/models
```

---

## Troubleshooting

### Hub Not Accessible

**Check**:
```powershell
netstat -an | findstr "3000"
```

**Should show**:
```
TCP    127.0.0.1:3000    LISTENING
```

**Fix**: Restart hub with `start-gui-with-browser.bat`

### LM Studio Not Responding

**Check**:
```powershell
netstat -an | findstr "1234"
```

**Fix**:
- Open LM Studio
- Go to Local Server tab
- Click "Start Server"

### SSE Connection Drops

**Common causes**:
- Firewall blocking
- Hub restarted
- Network timeout

**Fix**: Reconnect with proper headers

---

## Advanced: Tool Calling from LM Studio

LM Studio supports OpenAI's function calling format. You can define your hub tools as functions:

```json
{
  "model": "openai/gpt-oss-20b",
  "messages": [...],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "search_obsidian",
        "description": "Search Obsidian vault for notes",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query"
            }
          },
          "required": ["query"]
        }
      }
    }
  ]
}
```

Then implement the function to call your hub!

---

## Next Steps

1. **Test current setup**: Verify hub and LM Studio are both running
2. **Get full model list**: Check all available models in LM Studio
3. **Create bridge script**: Connect LM Studio to hub programmatically
4. **Test tool calling**: Make LM Studio call Obsidian search via hub
5. **Add to GUI**: Show LM Studio as connected client in CLIENTS tab

---

## Summary

✅ **Hub**: Running on port 3000 (SSE)  
✅ **LM Studio**: Running on port 1234 (OpenAI API)  
✅ **Models**: openai/gpt-oss-20b, qwen/qwen3-coder-30b  
✅ **Tools**: 75 available via hub  
⚠️ **Connection**: Need bridge script or MCP client

**Your hub is ready!** Just need to connect LM Studio as a client.
