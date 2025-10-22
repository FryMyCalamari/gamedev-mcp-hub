@echo off
REM GameDev MCP Hub - Master Startup Script
REM Starts the main hub with GUI which launches all configured servers

echo.
echo ========================================
echo   GameDev MCP Hub - Starting System
echo ========================================
echo.

REM Check if Node is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if build exists
if not exist "dist\index.js" (
    echo Building hub...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Build failed
        pause
        exit /b 1
    )
)

echo Starting GameDev MCP Hub...
echo.
echo The hub will automatically:
echo   - Start the GUI on http://localhost:3100
echo   - Connect to all enabled MCP servers:
echo     * Obsidian (Knowledge Management)
echo     * Blender (3D Modeling)
echo     * Godot (Game Engine)
echo     * GitHub (Version Control)
echo     * Meshy AI (3D Generation) 
echo     * Sentry (Error Tracking)
echo   - Be ready for LM Studio/Claude connections
echo.
echo Press Ctrl+C to stop the hub
echo.

REM Start the hub with GUI
node dist\index.js

echo.
echo Hub stopped.
pause
