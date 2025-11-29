#!/usr/bin/env pwsh
# Script to start the backend server

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting Ceylon Backend Server" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location backend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found in backend directory!" -ForegroundColor Red
    Write-Host "Please create a .env file with required environment variables" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting backend server on port 5000..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Set NODE_ENV and start the server
$env:NODE_ENV = "development"
npm start
