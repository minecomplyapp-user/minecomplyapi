# Backend API Test Suite - Execution Script (PowerShell)
# This script runs all tests in the recommended order and generates a report

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MineComply Backend API Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test results tracking
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0

# Function to run a test file
function Run-Test {
    param (
        [string]$TestFile,
        [string]$TestName
    )
    
    Write-Host "Running: $TestName" -ForegroundColor Yellow
    Write-Host "File: $TestFile"
    Write-Host ""
    
    $result = npm run test:e2e -- $TestFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $TestName PASSED" -ForegroundColor Green
        $script:PassedTests++
    } else {
        Write-Host "✗ $TestName FAILED" -ForegroundColor Red
        $script:FailedTests++
    }
    
    $script:TotalTests++
    Write-Host ""
    Write-Host "------------------------------------------"
    Write-Host ""
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from minecomplyapi directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Validate Prisma schema
Write-Host "Validating Prisma schema..." -ForegroundColor Cyan
$validateResult = npx prisma validate 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Schema valid" -ForegroundColor Green
} else {
    Write-Host "✗ Schema validation failed" -ForegroundColor Red
    exit 1
}

# Check migration status
Write-Host ""
Write-Host "Checking migration status..." -ForegroundColor Cyan
npx prisma migrate status
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Test Execution" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Run tests in order
Run-Test "cmvr-quarter-filtering.e2e-spec.ts" "CMVR Quarter/Year Filtering Tests"
Run-Test "guest-remarks.e2e-spec.ts" "Guest Remarks CRUD Tests"
Run-Test "ecc-tally.e2e-spec.ts" "ECC Tally Calculation Tests"
Run-Test "document-generation.e2e-spec.ts" "Document Generation Tests"
Run-Test "integration.e2e-spec.ts" "Integration & E2E Workflow Tests"

# Generate summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Execution Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Test Suites Run: $TotalTests"
Write-Host "Passed: $PassedTests" -ForegroundColor Green
Write-Host "Failed: $FailedTests" -ForegroundColor Red
Write-Host ""

if ($FailedTests -eq 0) {
    Write-Host "✓ All tests passed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
}

