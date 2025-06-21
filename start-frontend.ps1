# Frontend Startup Script for Habit Tracker
# This script starts the React development server

Write-Host "======================================" -ForegroundColor Green
Write-Host "   HABIT TRACKER - Frontend Starter  " -ForegroundColor Green  
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "http://localhost:5000/habits" -TimeoutSec 5 -UseBasicParsing | Out-Null
    Write-Host "Backend is running and responding!" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Backend doesn't seem to be running!" -ForegroundColor Red
    Write-Host "   Please start the backend first with:" -ForegroundColor Yellow
    Write-Host "   .\start-server.ps1" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit
    }
}

Write-Host ""
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Browser should open automatically" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
$frontendPath = Join-Path -Path $PSScriptRoot -ChildPath "habit-tracker-frontend"
Set-Location -Path $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed!" -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host "Starting React development server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor DarkYellow
Write-Host ""

# Start the development server
npm start
