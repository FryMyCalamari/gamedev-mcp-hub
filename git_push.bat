@echo off
REM Git push script for GameDev MCP Hub
REM Run this AFTER creating a GitHub repository and setting the remote

echo ========================================
echo GameDev MCP Hub - Push to GitHub
echo ========================================
echo.

cd /d D:\Power\gamedev-mcp-hub

REM Check if remote exists
git remote -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: No git remote configured!
    echo.
    echo Please first run:
    echo git remote add origin https://github.com/YOUR_USERNAME/gamedev-mcp-hub.git
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo Current remotes:
git remote -v
echo.

echo Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Common issues:
    echo - Make sure you've created the repository on GitHub
    echo - Check your GitHub authentication
    echo - Verify the remote URL is correct
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub!
echo ========================================
echo.
echo Your GameDev MCP Hub is now on GitHub!
echo.
pause
