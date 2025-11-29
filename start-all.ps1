#!/usr/bin/env pwsh
# Script to start all services (Backend, Frontend, Admin)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Ceylon E-Commerce Stack" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Directory,
        [string]$Command,
        [int]$Port
    )
    
    Write-Host "Starting $Name on port $Port..." -ForegroundColor Green
    
    $scriptBlock = @"
Set-Location '$Directory'
Write-Host '$Name is starting...' -ForegroundColor Cyan
$Command
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $scriptBlock
}

# Start Backend
Start-Service -Name "Backend" -Directory "$PSScriptRoot\backend" -Command "npm start" -Port 5000
Start-Sleep -Seconds 3

# Start Frontend
Start-Service -Name "Frontend" -Directory "$PSScriptRoot\frontend" -Command "npm run dev" -Port 5173
Start-Sleep -Seconds 2

# Start Admin
Start-Service -Name "Admin Panel" -Directory "$PSScriptRoot\admin" -Command "npm run dev" -Port 5174

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "All services started!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:     http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor Yellow
Write-Host "Admin Panel: http://localhost:5174" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close the individual PowerShell windows to stop each service" -ForegroundColor Gray
