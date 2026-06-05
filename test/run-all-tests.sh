#!/bin/bash

# Backend API Test Suite - Execution Script
# This script runs all tests in the recommended order and generates a report

echo "=========================================="
echo "MineComply Backend API Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}Running: ${test_name}${NC}"
    echo "File: ${test_file}"
    echo ""
    
    if npm run test:e2e -- ${test_file} 2>&1; then
        echo -e "${GREEN}✓ ${test_name} PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗ ${test_name} FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    echo ""
    echo "------------------------------------------"
    echo ""
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from minecomplyapi directory.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Validate Prisma schema
echo "Validating Prisma schema..."
if npx prisma validate; then
    echo -e "${GREEN}✓ Schema valid${NC}"
else
    echo -e "${RED}✗ Schema validation failed${NC}"
    exit 1
fi

# Check migration status
echo ""
echo "Checking migration status..."
npx prisma migrate status
echo ""

echo "=========================================="
echo "Starting Test Execution"
echo "=========================================="
echo ""

# Run tests in order
run_test "cmvr-quarter-filtering.e2e-spec.ts" "CMVR Quarter/Year Filtering Tests"
run_test "guest-remarks.e2e-spec.ts" "Guest Remarks CRUD Tests"
run_test "ecc-tally.e2e-spec.ts" "ECC Tally Calculation Tests"
run_test "document-generation.e2e-spec.ts" "Document Generation Tests"
run_test "integration.e2e-spec.ts" "Integration & E2E Workflow Tests"

# Generate summary
echo "=========================================="
echo "Test Execution Summary"
echo "=========================================="
echo ""
echo "Total Test Suites Run: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed successfully!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi

