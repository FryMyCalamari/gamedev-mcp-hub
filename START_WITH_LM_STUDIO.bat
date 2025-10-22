@echo off
echo ============================================
echo  GameDev MCP Hub - LM Studio Ready
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Checking environment...
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file with your tokens.
    echo See .env.example for template.
    pause
    exit /b 1
)

if not exist "dist\index-sse.js" (
    echo [2/4] Building hub...
    call npm run build
    if errorlevel 1 (
        echo ERROR: Build failed!
        pause
        exit /b 1
    )
) else (
    echo [2/4] Hub already built
)

echo [3/4] Starting GameDev MCP Hub (SSE mode)...
echo.
echo  MCP Endpoint: http://localhost:3000/sse
echo  GUI Dashboard: http://localhost:3100
echo  Health Check: http://localhost:3000/health
echo.
echo [4/4] Hub is starting...
echo.
echo ============================================
echo  CONFIGURE LM STUDIO NOW:
echo ============================================
echo.
echo 1. Open LM Studio
echo 2. Go to Settings -^> Extensions (or Developer)
echo 3. Add MCP Server:
echo    URL: http://localhost:3000/sse
echo    Name: GameDev MCP Hub
echo 4. Restart LM Studio
echo 5. Load a model and start chatting!
echo.
echo See docs\LM_STUDIO_SETUP.md for full guide
echo.
echo ============================================
echo  PRESS CTRL+C TO STOP THE HUB
echo ============================================
echo.

npm run start:sse
