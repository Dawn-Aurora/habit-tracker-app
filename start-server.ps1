# Find and kill any processes using port 5000
Write-Host "Looking for processes on port 5000..." -ForegroundColor Yellow
$connections = netstat -ano | findstr ":5000"
$connections | ForEach-Object {
    $parts = $_.Trim() -split '\s+'
    if ($parts.Count -gt 4) {
        $processId = $parts[-1]
        if ($processId -match '^\d+$' -and $processId -ne '0') {
            Write-Host "Killing process $processId..." -ForegroundColor Red
            taskkill /F /PID $processId 2>$null
        }
    }
}

# Wait to ensure port is freed
Start-Sleep -Seconds 2

# Start the backend server
Write-Host "`n=== STARTING BACKEND SERVER ===" -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Green

npm start

# Start a browser to open the test API page
Write-Host "Opening test API interface in browser..." -ForegroundColor Cyan
$scriptPath = $PSScriptRoot
$testApiPath = Join-Path -Path $scriptPath -ChildPath "test-api.html"
Start-Process $testApiPath
