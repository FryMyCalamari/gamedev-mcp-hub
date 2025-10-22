@echo off
REM GameDev MCP Hub - GUI Startup Script
REM This script builds and starts the hub with GUI enabled

echo ========================================
echo   GameDev MCP Hub - GUI Launcher
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist\" (
    echo [INFO] First time setup - Building project...
    echo.
    call npm run build
    if errorlevel 1 (
        echo.
        echo [ERROR] Build failed! Please check the error messages above.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Build completed!
    echo.
) else (
    echo [INFO] Project already built. Use 'npm run build' to rebuild if needed.
    echo.
)

echo [INFO] Starting GameDev MCP Hub (SSE - Multi-Client)...
echo [INFO] GUI will be available at: http://localhost:3100
echo [INFO] SSE endpoint: http://localhost:3000/sse
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the hub with SSE transport (multi-client support)
npm run start:sse

REM If npm start exits, pause so user can see any errors
if errorlevel 1 (
    echo.
    echo [ERROR] Hub failed to start! Check error messages above.
    echo.
    pause
)
