# Check if there's a process using port 5000 and kill it
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Looking for processes on port 5000..." -ForegroundColor Yellow

# Find and kill any processes using port 5000
$connections = netstat -ano | findstr ":5000"
$connections | ForEach-Object {
    $parts = $_.Trim() -split '\s+'
    if ($parts.Count -gt 4) {
        $processId = $parts[-1]
        if ($processId -match '^\d+$' -and $processId -ne '0') {
            Write-Host "Killing process $processId..." -ForegroundColor Red
            taskkill /F /PID $processId | Out-Null
        }
    }
}

# Wait to ensure port is freed
Start-Sleep -Seconds 2

# Start a browser to open the test API page
Write-Host "Opening test API interface in browser..." -ForegroundColor Cyan
$scriptPath = $PSScriptRoot
$testApiPath = Join-Path -Path $scriptPath -ChildPath "test-api.html"
Start-Process $testApiPath

# Start the server
Write-Host "Starting backend server. Please keep this window open." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor DarkYellow
Write-Host "Access the API testing page at file://$testApiPath" -ForegroundColor Magenta
Write-Host "Access the API at http://localhost:5000/habits" -ForegroundColor Magenta

Set-Location -Path $PSScriptRoot # Make sure we're in the right directory
npx ts-node src/app.ts
