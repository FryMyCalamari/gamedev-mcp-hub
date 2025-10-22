# 🚀 Quick Start - LM Studio + MCP Hub

**Get your local AI connected to 100+ game development tools in 5 minutes!**

---

## ⚡ Super Quick Setup

### 1. Start the Hub

Double-click: **`START_WITH_LM_STUDIO.bat`**

Or manually:
```bash
npm run start:sse
```

### 2. Configure LM Studio

**Open LM Studio** → Settings → Extensions (or Developer tab)

**Add MCP Server**:
- **URL**: `http://localhost:3000/sse`
- **Name**: `GameDev MCP Hub`
- **Enable**: ✅

**Restart LM Studio**

### 3. Test It!

Load a model in LM Studio, then try:

```
What MCP tools are available from the gamedev hub?
```

**Should show**: ~100 tools from Obsidian, Blender, GitHub, Godot, Thingiverse!

---

## 📊 What You Get

**Connected Servers**:
- 🗒️ **Obsidian** (18 tools) - Knowledge management
- 🔷 **Blender** (17 tools) - 3D modeling  
- 🐙 **GitHub** (43 tools) - Version control
- 🎮 **Godot** (22 tools) - Game engine
- 🏺 **Thingiverse** (~10 tools) - 3D models

**Total**: ~100 tools for game development!

**Your AI can now**:
- Search your notes in Obsidian
- Control Blender for 3D work
- Manage GitHub repos and code
- Work with Godot projects
- Find 3D models on Thingiverse

---

## 🎮 Example Prompts

Try these in LM Studio once connected:

### Search Your Notes
```
Search my Obsidian vault for notes about "game mechanics"
```

### Code Management
```
List my GitHub repositories and find the most recently updated one
```

### 3D Assets
```
Search Thingiverse for "game character" 3D models
```

### Multi-Tool Workflow
```
Help me plan a new game feature:
1. Check my Obsidian notes for similar ideas
2. Find related code in my GitHub repos
3. Suggest 3D assets from Thingiverse
```

---

## 🔧 Troubleshooting

### LM Studio Doesn't Have MCP Options

**Your LM Studio version may not support MCP yet.**

**Solutions**:

**Option A**: Update LM Studio
- Download latest from https://lmstudio.ai/
- Check changelog for MCP support

**Option B**: Use Claude Desktop instead
- Has full native MCP support
- Free tier available
- Setup: See `docs/MULTI_CLIENT_SETUP.md`

**Option C**: Wait for LM Studio update
- MCP support is actively being added
- Follow LM Studio announcements

### Hub Won't Start

**Check**:
```bash
# Is something on port 3000?
netstat -ano | findstr 3000

# Kill it if needed (replace PID)
taskkill /PID <PID> /F

# Try again
npm run start:sse
```

### LM Studio Connects But No Tools

**Verify hub is working**:
```bash
curl http://localhost:3000/health
```

Should show:
```json
{"status":"healthy","servers":4,"clients":1}
```

**Check GUI**: http://localhost:3100
- Go to SERVERS tab
- Verify 4-5 servers show as "connected"
- Go to TOOLS tab  
- Should see ~100 tools listed

---

## 📚 Full Guides

**Detailed setup**: `docs/LM_STUDIO_SETUP.md`  
**Multi-client config**: `docs/MULTI_CLIENT_SETUP.md`  
**Architecture**: `docs/ARCHITECTURE_AND_CONNECTIONS.md`

---

## 🎯 Recommended LM Studio Models

**Best for tool/function calling**:
1. **Mistral 7B Instruct v0.3**
2. **Mixtral 8x7B Instruct**
3. **Llama 3 8B/70B Instruct**
4. **Qwen 2.5 7B/14B**
5. **CodeLlama 34B Instruct**

Download in LM Studio: Search tab → Model name

---

## ✅ Status Check

**Is everything working?**

- [ ] Hub running (`npm run start:sse`)
- [ ] GUI accessible (http://localhost:3100)
- [ ] Servers connected (4-5 showing in GUI)
- [ ] LM Studio configured with MCP server
- [ ] Model loaded in LM Studio
- [ ] Test prompt works

**All checked?** You're ready to build games with AI! 🎉

---

## 🚀 Next Level

**Connect multiple AIs simultaneously**:
- LM Studio for main work
- Claude Desktop for complex reasoning
- Your own scripts via API

**They can all use the hub at the same time!**

See `docs/MULTI_CLIENT_SETUP.md` for details.

---

**Questions?** Check the logs: `logs/hub.log`  
**Need help?** See `docs/` folder for full documentation  
**Working?** Start building your game! 🎮
