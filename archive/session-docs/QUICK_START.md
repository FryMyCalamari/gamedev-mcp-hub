# 🚀 Quick Start Guide - GameDev MCP Hub

## What is This?

The GameDev MCP Hub is a **central hub** that connects AI assistants (like Claude Desktop) to multiple game development tools through a single unified interface.

```
Your AI Assistant → GameDev Hub → [Obsidian, Blender, Godot, Unity, GitHub, Discord]
```

## ⚡ Fastest Start (Windows)

1. **Double-click**: `start-gui-with-browser.bat`
2. **Wait** for browser to open at http://localhost:3100
3. **Done!** You'll see your connected servers and available tools

## 📋 Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Configured MCP Servers** - At least one server enabled in `config/mcp-servers.json`

## 🎯 First Time Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Servers

Edit `config/mcp-servers.json` and enable the servers you want:

```json
{
  "servers": {
    "obsidian": {
      "enabled": true,  // ← Change to true
      "command": "path/to/obsidian/mcp-server.exe",
      ...
    },
    "blender": {
      "enabled": true,  // ← Change to true
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

### 3. Start the Hub

**Option A: GUI with Browser (Recommended)**
```bash
# Windows
start-gui-with-browser.bat

# PowerShell
.\start-gui.ps1
```

**Option B: Command Line**
```bash
npm run build
npm start
```

## 🌐 Using the GUI Dashboard

Once started, visit **http://localhost:3100**

### Dashboard Tabs:

1. **SERVERS** - View connected servers and their status
2. **TOOLS** - Browse all available tools (35+ tools currently!)
3. **DOCS** - View detailed documentation for each server
4. **SETTINGS** - Adjust font sizes and UI preferences

### GUI Features:
- ✅ Real-time server status monitoring
- ✅ Tool search and filtering
- ✅ WebSocket live updates
- ✅ Customizable font sizes
- ✅ Retro terminal aesthetic

## 🤖 Connect Claude Desktop

To use these tools in Claude Desktop:

### 1. Remove Direct Server Connections

Edit your Claude Desktop config:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Remove** any direct server entries (obsidian, blender, etc.)

### 2. Add ONLY the Hub

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

### 3. Restart Claude Desktop

All tools from all servers will now be available in Claude!

## 📊 Current Configuration

Your hub is currently configured with:

### Enabled Servers:
- **Obsidian** - 18 tools (knowledge management, notes, semantic search)
- **Blender** - 17 tools (3D modeling, rendering, animation)

### Available for Configuration:
- **Godot** - 22 tools (game engine)
- **Unity** - 31 tools (game engine)
- **GitHub** - 43 tools (version control)
- **Discord** - 32 tools (communication)
- **Pixellab** - Pixel art generation
- **Filesystem** - Secure file operations
- **Web Scraper** - Browser automation

## 🔧 Common Tasks

### Build the Project
```bash
npm run build
```

### Start in Development Mode
```bash
npm run dev
```

### Check Server Status
Visit http://localhost:3100/api/servers

### View Logs
```
logs/hub.log       - Main hub logs
logs/error.log     - Error logs only
```

### Enable Another Server

1. Edit `config/mcp-servers.json`
2. Set `"enabled": true` for the server
3. Configure the `command` and `args`
4. Restart the hub
5. Check GUI dashboard to verify connection

## ❓ Troubleshooting

### Server Won't Connect

1. **Check the logs**: `logs/hub.log`
2. **Verify the executable path**: Make sure the `command` path is correct
3. **Check dependencies**: Ensure the MCP server is properly installed
4. **Environment variables**: Verify all required env vars are set

### GUI Not Loading

1. **Check port 3100**: Make sure nothing else is using it
2. **Build the project**: Run `npm run build` first
3. **Check config**: Verify `rest_api: true` in `config/hub-config.json`

### Tools Not Appearing in Claude

1. **Restart Claude Desktop** after changing config
2. **Check Claude config**: Ensure only the hub is configured, not individual servers
3. **Check hub is running**: Visit http://localhost:3100 to verify
4. **Review logs**: Look for connection errors

### Connection Closed Errors (Obsidian)

**Cause**: Multiple programs trying to connect to the same MCP server

**Solution**: 
- Remove Obsidian from Claude Desktop config
- Only connect through the hub
- Ensure Obsidian Local REST API plugin is running

## 📚 Additional Documentation

- **Architecture**: `docs/ARCHITECTURE_AND_CONNECTIONS.md` - How the hub works
- **Obsidian Setup**: `docs/OBSIDIAN_INTEGRATION.md` - Detailed Obsidian guide
- **Blender Setup**: `docs/BLENDER_INTEGRATION.md` - Blender configuration
- **GUI Guide**: `docs/GUI.md` - Web interface details
- **Session Notes**: `session-notes/` - Historical development notes

## 🎮 Example Use Cases

Once connected to Claude Desktop, you can:

### Obsidian
- "Search my vault for notes about MCP architecture"
- "Create a new note called 'Project Ideas' with these sections..."
- "Read my daily note and summarize it"

### Blender
- "Create three cubes in Blender arranged in a line"
- "Add a red material to the selected object"
- "Render the current scene"

### Combined Workflows
- "Search my Obsidian vault for 3D model ideas, then create them in Blender"
- "Document the current Blender scene in a new Obsidian note"

## 🚀 Next Steps

1. ✅ Start the hub with `start-gui-with-browser.bat`
2. ✅ Verify servers are connected in the GUI
3. ✅ Configure Claude Desktop to use the hub
4. ✅ Test some tools through Claude
5. 📖 Read the architecture guide for advanced configuration

## 💡 Pro Tips

- **Use the GUI** to discover available tools before using them in Claude
- **Check the DOCS tab** for detailed tool parameters and examples
- **Monitor the SERVERS tab** to see real-time connection status
- **Adjust font sizes** in SETTINGS for better readability
- **Keep logs open** when troubleshooting issues

---

**Need Help?** Check the logs first, then review the detailed documentation in the `docs/` folder.

**Working?** Great! Now you have 35+ game development tools available to your AI assistant!
