$ErrorActionPreference = "Stop"

Write-Host "BARBERSHOPNEARME - Installing frontend..." -ForegroundColor Cyan

if (-not (Test-Path ".\vite.config.js")) {
    Write-Host "ERROR: Run this from inside the frontend folder (where vite.config.js is)." -ForegroundColor Red
    exit 1
}

$zipPath = Join-Path $env:USERPROFILE "Downloads\barbershopnearme-frontend-complete.zip"

if (-not (Test-Path $zipPath)) {
    Write-Host "ERROR: barbershopnearme-frontend-complete.zip not found in Downloads." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1 - Removing old src..." -ForegroundColor Yellow
if (Test-Path ".\src") { Remove-Item -Recurse -Force ".\src" }
Write-Host "Done." -ForegroundColor Green

Write-Host "Step 2 - Extracting new files..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath "." -Force
Write-Host "Done." -ForegroundColor Green

Write-Host "Step 3 - Installing packages..." -ForegroundColor Yellow
npm install

Write-Host "Step 4 - Starting dev server..." -ForegroundColor Cyan
npm run dev
