@echo off
REM GameDev MCP Hub - GUI Startup Script with Browser Auto-Open
REM This script builds the project, starts the hub, and opens the browser
REM 
REM The hub starts with GUI enabled by default (configured in config/hub-config.json)
REM GUI features: Web dashboard, server monitoring, tool browser, real-time WebSocket updates

title GameDev MCP Hub - Starting...

echo ========================================
echo   GameDev MCP Hub - GUI Launcher
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo [ERROR] Please install Node.js 20+ from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Dependencies not installed. Installing now...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo.
        pause
        exit /b 1
    )
    echo.
)

REM Check if dist folder exists, if not build
if not exist "dist\" (
    echo [INFO] Project not built. Building now...
    echo.
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed! Please check the error messages above.
        echo.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Project already built. Skipping build.
    echo [TIP] Run 'npm run build' manually if you made code changes.
    echo.
)

echo [SUCCESS] Ready to start!
echo.
echo [INFO] Starting GameDev MCP Hub (SSE - Multi-Client)...
echo [INFO] GUI Dashboard: http://localhost:3100
echo [INFO] SSE Endpoint: http://localhost:3000/sse
echo [INFO] Multiple AI clients can connect simultaneously!
echo.
echo ========================================
echo [TIP] Watch for these success messages:
echo   - "Connected to X servers, Y failed"
echo   - "Total tools available: Z"
echo   - "GUI Server running on http://127.0.0.1:3100"
echo ========================================
echo.
echo Opening browser in 5 seconds...
echo.

REM Start the hub in background with SSE transport (multi-client support)
start /B npm run start:sse

REM Wait 5 seconds for server to start
timeout /t 5 /nobreak >nul

REM Open browser
echo [INFO] Opening browser...
start http://localhost:3100

title GameDev MCP Hub - Running

echo.
echo ========================================
echo [SUCCESS] Hub is running!
echo ========================================
echo.
echo Your browser should open automatically.
echo If not, manually open: http://localhost:3100
echo.
echo Connected Servers:
echo   - Obsidian (Knowledge Management)
echo   - Blender (3D Modeling)
echo   - And more configured in config/mcp-servers.json
echo.
echo Press Ctrl+C to stop the server
echo Or close this window to shut down
echo.
echo ========================================
echo.

REM Keep the window open
pause >nul
