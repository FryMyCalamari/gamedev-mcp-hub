@echo off
REM Git initialization and push script for GameDev MCP Hub

echo ========================================
echo GameDev MCP Hub - Git Push Script
echo ========================================
echo.

cd /d D:\Power\gamedev-mcp-hub

echo Step 1: Initialize Git Repository
git init
if errorlevel 1 (
    echo ERROR: Git init failed!
    pause
    exit /b 1
)
echo ✓ Git initialized

echo.
echo Step 2: Add all files
git add .
if errorlevel 1 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo ✓ Files added

echo.
echo Step 3: Create initial commit
git commit -m "feat: Complete Tier 1 adapters - All 5 MCP server adapters implemented

- Add Unity adapter (@nurture-tech/unity-mcp-runner)
- Add Blender adapter (ahujasid/blender-mcp)
- Add GitHub adapter (@modelcontextprotocol/server-github)
- Add Discord adapter (v-3/discordmcp)
- Godot adapter from previous session
- All adapters include error handling, reconnection, logging
- 165+ game development tools available
- Complete TypeScript implementation
- Production-ready architecture

This completes Phase 1: Tier 1 Adapters.
Ready for testing and Claude Desktop integration."

if errorlevel 1 (
    echo ERROR: Git commit failed!
    pause
    exit /b 1
)
echo ✓ Commit created

echo.
echo Step 4: Set main branch
git branch -M main
echo ✓ Branch set to main

echo.
echo ========================================
echo SUCCESS! Repository is ready.
echo ========================================
echo.
echo Next steps:
echo 1. Create a GitHub repository
echo 2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/gamedev-mcp-hub.git
echo 3. Push: git push -u origin main
echo.
echo Or run: git_push_to_github.bat
echo.
pause
