# 🔌 MCP Server Integration Plan

## Current Status

✅ **Completed:**
- Blender MCP - Connected and working (17 tools)
- GUI Dashboard - Font size improvements added

🔄 **Next Steps:**
Integration and testing of remaining Tier 1 servers:
1. Godot MCP
2. Unity MCP
3. GitHub MCP
4. Discord MCP

---

## 🎮 1. Godot MCP Integration

### Repository
**Source**: https://github.com/ee0pdt/Godot-MCP

### Current Configuration
```json
{
  "enabled": false,
  "command": "python",
  "args": ["path/to/godot-mcp/server.py"],
  "category": "game-engine"
}
```

### Requirements
- Python 3.8+
- Godot Engine (3.x or 4.x)
- Godot project running with remote API enabled

### Expected Tools (22 tools)
Based on repository documentation:
- Scene Management: create_scene, load_scene, save_scene
- Node Operations: create_node, delete_node, get_node_properties, set_node_properties
- Script Operations: attach_script, create_gdscript
- Resource Management: load_resource, save_resource
- Animation: create_animation, keyframe operations
- Physics: configure_collision_shapes, rigid_body_setup
- And more...

### Integration Steps
1. ✅ Review Godot-MCP repository documentation
2. Clone/download Godot-MCP server
3. Install Python dependencies
4. Configure Godot project with remote API
5. Update mcp-servers.json with correct path
6. Test connection through GUI
7. Verify tool discovery
8. Document working configuration

### Testing Checklist
- [ ] Server starts without errors
- [ ] All 22 tools discovered
- [ ] Can connect/disconnect from GUI
- [ ] Tool calls execute successfully
- [ ] Errors handled gracefully
- [ ] Reconnection works

---

## 🎯 2. Unity MCP Integration

### Option A: Nurture Tech (Recommended)
**Repository**: https://github.com/nurture-tech/unity-mcp-server

#### Current Configuration
```json
{
  "enabled": false,
  "command": "npx",
  "args": ["-y", "@nurture-tech/unity-mcp-runner"],
  "category": "game-engine"
}
```

#### Requirements
- Node.js 18+
- Unity Editor (2021.3+)
- Unity project with MCP package installed

#### Expected Tools (31 tools)
- GameObject Management: create, delete, find, list
- Component Operations: add, remove, modify
- Scene Management: load, save, create
- Asset Management: import, export
- Hierarchy Operations: parent, unparent, reorder
- Transform Operations: move, rotate, scale
- Material/Shader Management
- Prefab Operations
- Build Operations
- And more...

### Option B: CoderGamester
**Repository**: https://github.com/CoderGamester/mcp-unity

#### Current Configuration
```json
{
  "enabled": false,
  "command": "node",
  "args": ["path/to/mcp-unity/dist/index.js"],
  "category": "game-engine"
}
```

#### Requirements
- Node.js 18+
- Unity Editor
- WebSocket connection to Unity

### Integration Steps
1. ✅ Review Unity MCP repository documentation
2. Choose between Nurture Tech vs CoderGamester
3. Install npm package or clone repository
4. Install Unity package in project
5. Configure Unity Editor settings
6. Update mcp-servers.json
7. Test connection through GUI
8. Verify tool operations
9. Document configuration

### Testing Checklist
- [ ] Server starts and connects to Unity
- [ ] All tools discovered
- [ ] GameObject creation works
- [ ] Component manipulation works
- [ ] Scene operations successful
- [ ] Errors handled properly

---

## 🐙 3. GitHub MCP Integration

### Repository
**Official**: https://github.com/modelcontextprotocol/servers/tree/main/src/github

### Current Configuration
```json
{
  "enabled": false,
  "command": "docker",
  "args": ["run", "-i", "--rm", "ghcr.io/github/github-mcp-server"],
  "category": "development",
  "env": {
    "GITHUB_TOKEN": "your-github-token-here"
  }
}
```

### Alternative (npx)
```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"]
}
```

### Requirements
- GitHub Personal Access Token (with repo permissions)
- Docker (for docker method) OR Node.js (for npx method)

### Expected Tools (43 tools)
Based on MCP GitHub server documentation:
- Repository Management: create, list, get, update, delete
- Branch Operations: create, delete, list, merge
- Commit Operations: list, get, create
- Pull Request Management: create, list, update, merge, close
- Issue Management: create, list, update, close, comment
- File Operations: read, write, delete
- Workflow Operations: trigger, list, get status
- Release Management: create, list, publish
- Collaborator Management
- And more...

### Integration Steps
1. ✅ Review GitHub MCP server documentation
2. Generate GitHub Personal Access Token
3. Choose deployment method (docker vs npx)
4. Update mcp-servers.json with token
5. Test connection through GUI
6. Verify authentication
7. Test basic operations (list repos, create issue)
8. Document token setup

### Testing Checklist
- [ ] Authentication successful
- [ ] Can list repositories
- [ ] Can create/edit issues
- [ ] Can create/merge PRs
- [ ] File operations work
- [ ] Workflow triggers work

### Security Note
⚠️ **IMPORTANT**: 
- Store GitHub token in environment variable
- Never commit token to repository
- Use `.env` file (add to .gitignore)
- Consider using GitHub App for production

---

## 💬 4. Discord MCP Integration

### Repository
**Source**: https://github.com/v-3/discordmcp

### Current Configuration
```json
{
  "enabled": false,
  "command": "npx",
  "args": ["-y", "discordmcp"],
  "category": "community",
  "env": {
    "DISCORD_BOT_TOKEN": "your-discord-bot-token-here"
  }
}
```

### Requirements
- Discord Bot Token (from Discord Developer Portal)
- Node.js 18+
- Discord server with bot added

### Expected Tools (32 tools)
Based on discordmcp documentation:
- Message Management: send, edit, delete, bulk_delete
- Channel Operations: create, delete, modify, list
- Guild/Server Management: get info, modify settings
- Member Management: kick, ban, unban, roles
- Role Management: create, delete, assign, remove
- Webhook Operations: create, execute
- Embed Creation: rich embeds, fields, formatting
- Reaction Management: add, remove, get
- Voice Channel Operations
- And more...

### Integration Steps
1. ✅ Review Discord MCP documentation
2. Create Discord Bot in Developer Portal
3. Generate and copy bot token
4. Add bot to test server
5. Update mcp-servers.json with token
6. Test connection through GUI
7. Verify bot appears online
8. Test message sending
9. Document bot setup

### Testing Checklist
- [ ] Bot authenticates successfully
- [ ] Bot shows as online in Discord
- [ ] Can send messages to channels
- [ ] Can manage roles
- [ ] Can create/delete channels
- [ ] Embeds work correctly

### Security Note
⚠️ **IMPORTANT**:
- Store bot token in environment variable
- Never commit token to repository
- Use `.env` file (add to .gitignore)
- Limit bot permissions to needed scopes

---

## 🔧 General Integration Process

### For Each Server:

#### 1. Pre-Integration Review
- [ ] Read official repository README
- [ ] Check requirements and dependencies
- [ ] Review available tools/commands
- [ ] Check authentication requirements
- [ ] Note any known issues

#### 2. Local Setup
- [ ] Install required dependencies
- [ ] Clone/download server code if needed
- [ ] Configure authentication (tokens, API keys)
- [ ] Test server runs standalone
- [ ] Verify tool discovery works

#### 3. Hub Configuration
- [ ] Update `config/mcp-servers.json`
- [ ] Set correct command and args
- [ ] Add environment variables
- [ ] Set enabled: true
- [ ] Configure timeout/retry settings

#### 4. Connection Testing
- [ ] Start hub: `npm start`
- [ ] Open GUI: http://localhost:3100
- [ ] Check server appears in SERVERS tab
- [ ] Click "Connect" button
- [ ] Verify status changes to "Connected"
- [ ] Check tool count displays correctly

#### 5. Functionality Testing
- [ ] Go to DOCS tab
- [ ] View server documentation
- [ ] Check all tools are listed
- [ ] Test 2-3 basic tools manually
- [ ] Verify error handling
- [ ] Test reconnection after disconnect

#### 6. Documentation
- [ ] Create setup guide in `docs/`
- [ ] Document authentication steps
- [ ] Add troubleshooting section
- [ ] Include example configurations
- [ ] Note any gotchas or limitations

---

## 📋 Integration Order

### Priority 1 (This Session)
1. **Godot MCP** - Game engine, high priority
2. **Unity MCP** - Game engine, high priority
3. **GitHub MCP** - Development workflow
4. **Discord MCP** - Community management

### Priority 2 (Future)
5. Pixellab MCP - Art generation
6. Game Asset Generator - Asset creation
7. Spine2D - Animation
8. Rhino - CAD modeling
9. Unreal Engine - Game engine
10. OP.GG - Analytics

---

## 🎯 Success Criteria

For each MCP server integration:
- ✅ Server connects successfully through GUI
- ✅ All expected tools discovered
- ✅ Manual connect/disconnect works
- ✅ Tool calls execute without errors
- ✅ Error handling is graceful
- ✅ Reconnection works after failure
- ✅ Documentation is complete
- ✅ Configuration is version controlled

---

## 📝 Integration Template

Use this template for each server:

### [Server Name] Integration

**Status**: 🔄 In Progress / ✅ Complete / ❌ Blocked

**Date Started**: YYYY-MM-DD  
**Date Completed**: YYYY-MM-DD

#### Configuration
```json
{
  "enabled": true,
  "command": "...",
  "args": ["..."],
  ...
}
```

#### Dependencies Installed
- [ ] List dependencies
- [ ] And versions

#### Authentication Setup
- [ ] Token/API key obtained
- [ ] Environment variable configured
- [ ] Tested authentication

#### Connection Test Results
- **Status**: Connected ✅ / Failed ❌
- **Tools Discovered**: X tools
- **Errors**: None / List any

#### Functionality Tests
- [ ] Test 1: Description - Result
- [ ] Test 2: Description - Result
- [ ] Test 3: Description - Result

#### Issues/Blockers
- None / List issues

#### Documentation Links
- Setup Guide: `docs/[server]-setup.md`
- Repository: [URL]
- Official Docs: [URL]

---

## 🚀 Next Actions

1. Start with **Godot MCP** (most documentation available)
2. Review repository and requirements
3. Set up local environment
4. Configure and test connection
5. Move to next server (Unity)

---

**Let's integrate them one at a time! Which server should we start with?**
