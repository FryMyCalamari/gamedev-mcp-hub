#!/usr/bin/env pwsh
# GameDev MCP Hub - GUI Startup Script (PowerShell)
# This script builds, starts the hub, and opens the browser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GameDev MCP Hub - GUI Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "[INFO] First time setup - Building project..." -ForegroundColor Yellow
    Write-Host ""
    
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Build failed! Please check the error messages above." -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] Build completed!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "[INFO] Project already built. Use 'npm run build' to rebuild if needed." -ForegroundColor Gray
    Write-Host ""
}

Write-Host "[INFO] Starting GameDev MCP Hub..." -ForegroundColor Yellow
Write-Host "[INFO] GUI will be available at: http://localhost:3100" -ForegroundColor Cyan
Write-Host ""
Write-Host "Waiting 3 seconds for server to start, then opening browser..." -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the hub in background job
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm start
}

# Wait 3 seconds for server to start
Start-Sleep -Seconds 3

# Open browser
Write-Host "[INFO] Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3100"

# Wait for the job (blocks until Ctrl+C)
try {
    Receive-Job -Job $job -Wait
} catch {
    Write-Host ""
    Write-Host "[INFO] Shutting down..." -ForegroundColor Yellow
} finally {
    Stop-Job -Job $job -ErrorAction SilentlyContinue
    Remove-Job -Job $job -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "[INFO] Hub stopped." -ForegroundColor Gray
