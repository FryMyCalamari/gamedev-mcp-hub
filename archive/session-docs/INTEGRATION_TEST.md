# 🧪 Integration Test Plan - New Servers & Skills

**Date**: October 21, 2025  
**Testing**: 3 MCP Servers + 2 Skills  
**Status**: Ready for Testing

---

## 📋 What We're Testing

### New MCP Servers
1. **GitHub** - Repository management, PRs, issues, code search
2. **Godot** - Game engine integration
3. **Thingiverse** - 3D model search and retrieval

### New Skills
1. **algorithmic-art** - Generative art creation with p5.js
2. **mcp-builder** - MCP server creation assistant

---

## 🔧 Setup Required

### 1. Environment Variables (.env file)

Create or update `.env` in the hub root:

```bash
# GitHub (REQUIRED for GitHub server)
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# Godot (Optional - only if you have a Godot project)
GODOT_PROJECT_PATH=C:\Path\To\Your\Godot\Project

# Thingiverse (REQUIRED for Thingiverse server)
THINGIVERSE_API_TOKEN=your_thingiverse_token_here
```

### 2. Get Your Tokens

#### GitHub Token:
1. Go to https://github.com/settings/tokens
2. "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`, `read:org`, `user`
4. Copy token

#### Thingiverse Token:
1. Go to https://www.thingiverse.com/apps/create
2. Create an application
3. Get your access token

#### Godot (Optional):
- If you don't have a Godot project, Godot server may not fully connect
- That's OK - we can still verify it attempts to connect

---

## 🚀 Build and Start

```bash
# In the hub directory
npm run build
npm start
```

Or use the GUI launcher:
```bash
start-gui-with-browser.bat
```

---

## ✅ Test Plan

### Test 1: GitHub Server

**Expected**: ✅ Connected, ~43 tools

**Check**:
1. Open http://localhost:3100
2. Go to SERVERS tab
3. Find "github" card
4. Should show: ✅ Connected

**If not connected**:
- Check logs: `logs/hub.log | grep github`
- Verify GitHub token in `.env`
- Verify token has correct permissions

**Try a tool** (via GUI TOOLS tab):
- Look for `github__search_code`
- Look for `github__create_issue`
- Look for `github__get_file_contents`

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:
___________________________________________

---

### Test 2: Godot Server

**Expected**: 
- ✅ Connected (if GODOT_PROJECT_PATH is set and valid)
- ⚠️ Disconnected (if no project path or Godot not running)

**Check**:
1. Go to SERVERS tab
2. Find "godot" card
3. Check status

**If you have Godot**:
- Open your Godot project
- Ensure Godot MCP plugin is installed
- Restart hub

**If you don't have Godot**:
- Expected to not connect
- That's OK - we're validating config

**Result**: ⬜ Pass / ⬜ Fail / ⬜ Skip (no Godot)

**Notes**:
___________________________________________

---

### Test 3: Thingiverse Server

**Expected**: ✅ Connected, multiple tools

**Check**:
1. Go to SERVERS tab
2. Find "thingiverse" card
3. Should show: ✅ Connected

**Try a tool**:
- Look for `thingiverse__search`
- Look for `thingiverse__get_thing`

**If not connected**:
- Check logs: `logs/hub.log | grep thingiverse`
- Verify Thingiverse token in `.env`

**Result**: ⬜ Pass / ⬜ Fail

**Notes**:
___________________________________________

---

### Test 4: Skills Loading

**Expected**: Skills system initialized

**Check**:
1. Look in logs for skills-related messages
2. Check if `skills/` directory exists
3. Verify skills are loaded

**For now**: Skills integration is next phase
- We're testing server integration first
- Skills will be tested separately

**Result**: ⬜ Pending / ⬜ Started

**Notes**:
___________________________________________

---

## 📊 Summary

### Servers Tested:
- ⬜ GitHub
- ⬜ Godot  
- ⬜ Thingiverse

### Overall Status:
- Connected servers: _____ / 3 (or 2 if no Godot)
- Total tools now: _____ (was 35)
- Issues found: _____

### Next Steps:
- [ ] Fix any connection issues
- [ ] Generate TOOLS.md for each server
- [ ] Document working examples
- [ ] Move to Skills integration

---

## 🔍 Debugging Commands

### Check Hub Logs
```bash
# All logs
Get-Content logs\hub.log -Tail 50

# GitHub only
Get-Content logs\hub.log | Select-String "github"

# Godot only
Get-Content logs\hub.log | Select-String "godot"

# Thingiverse only
Get-Content logs\hub.log | Select-String "thingiverse"

# Errors only
Get-Content logs\error.log -Tail 20
```

### Check Configuration
```bash
# View current config
Get-Content config\mcp-servers.json | ConvertFrom-Json | Select-Object -ExpandProperty servers
```

### Test Individual Server
```bash
# GitHub
$env:GITHUB_PERSONAL_ACCESS_TOKEN="your-token"
npx -y @modelcontextprotocol/server-github

# Thingiverse
$env:THINGIVERSE_API_TOKEN="your-token"
npx -y @gpaul-mcp/MCP_thingiverse

# Godot
$env:GODOT_PROJECT_PATH="C:\Path\To\Project"
npx -y godot-mcp
```

---

## 📝 Test Results

**Tester**: ___________  
**Date**: ___________  
**Time**: ___________

**Overall Result**: ⬜ Success / ⬜ Partial / ⬜ Failed

**Ready for Skills Integration**: ⬜ Yes / ⬜ No

**Comments**:
___________________________________________
___________________________________________
___________________________________________

---

## 🎯 What's Next

Once servers are tested and working:

1. **Generate Documentation**
   - Run tools:generate for each server
   - Create EXAMPLES.md files

2. **Skills Integration**
   - Convert algorithmic-art skill
   - Convert mcp-builder skill
   - Test skills with Claude Desktop

3. **Update Main README**
   - Update tool counts
   - Add new servers to list
   - Update screenshots

4. **Create Tutorial Videos/Docs**
   - Show how to use GitHub server
   - Show how to use Thingiverse
   - Demonstrate skills

---

**Let's test! Report your findings and we'll fix any issues before moving to skills.**
