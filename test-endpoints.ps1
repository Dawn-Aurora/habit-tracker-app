# Test script for Habit Tracker API endpoints

$baseUrl = "http://localhost:5000"

Write-Host "`n1. Testing GET /habits - Should list all habits"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/habits" -Method Get
    Write-Host "Success! Retrieved habits:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n2. Testing POST /habits - Creating a new habit"
$newHabit = @{
    name = "Exercise daily"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/habits" -Method Post -Body $newHabit -ContentType "application/json"
    Write-Host "Success! Created new habit:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    $habitId = $response.data.id
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host "`n3. Testing POST /habits - Testing validation (should fail with error)"
$invalidHabit = @{
    name = ""  # Empty name should trigger validation error
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/habits" -Method Post -Body $invalidHabit -ContentType "application/json"
} catch {
    Write-Host "Expected validation error:" -ForegroundColor Yellow
    $_.ErrorDetails.Message
}

if ($habitId) {
    Write-Host "`n4. Testing PUT /habits/:id - Updating a habit"
    $updateHabit = @{
        name = "Exercise daily - Updated"
        completedDates = @("2025-06-17T10:00:00Z")
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/habits/$habitId" -Method Put -Body $updateHabit -ContentType "application/json"
        Write-Host "Success! Updated habit:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }

    Write-Host "`n5. Testing DELETE /habits/:id - Deleting a habit"
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/habits/$habitId" -Method Delete
        Write-Host "Success! Habit deleted." -ForegroundColor Green
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host "`nTests completed!"
