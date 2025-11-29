# Test Backend Connectivity

Write-Host "Testing Ceylon Backend API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://ceylonbackend.vercel.app/health" -Method Get -ErrorAction Stop
    Write-Host "   ✓ Health Check: $($health.message)" -ForegroundColor Green
    Write-Host "   Database Status: $($health.database)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Root Endpoint
Write-Host "2. Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $root = Invoke-RestMethod -Uri "https://ceylonbackend.vercel.app/" -Method Get -ErrorAction Stop
    Write-Host "   ✓ Root: $($root.message)" -ForegroundColor Green
    Write-Host "   Status: $($root.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Root Endpoint Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Products List (CORS test)
Write-Host "3. Testing Products API (CORS test)..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "https://ceylonbackend.vercel.app/api/product/list" -Method Get -ErrorAction Stop
    if ($products.success) {
        Write-Host "   ✓ Products API Working" -ForegroundColor Green
        Write-Host "   Products Count: $($products.products.Count)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Products API returned error: $($products.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Products API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed, your backend is working correctly." -ForegroundColor Green
Write-Host "If tests failed, check:" -ForegroundColor Yellow
Write-Host "  1. Backend is deployed on Vercel" -ForegroundColor White
Write-Host "  2. Environment variables are set" -ForegroundColor White
Write-Host "  3. MongoDB connection is working" -ForegroundColor White
Write-Host ""
