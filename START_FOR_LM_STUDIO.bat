@echo off
echo ============================================
echo  GameDev MCP Hub - Starting for LM Studio
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Checking build...
if not exist "dist\index.js" (
    echo Build not found. Building now...
    call npm run build
    if errorlevel 1 (
        echo ERROR: Build failed!
        pause
        exit /b 1
    )
)

echo [2/3] Starting hub...
echo.
echo Hub will start now. Keep this window open!
echo.
echo GUI available at: http://localhost:3100
echo.
echo Configure LM Studio to use:
echo   Command: node
echo   Args: %~dp0dist\index.js
echo.
echo ============================================
echo.

npm start

pause
