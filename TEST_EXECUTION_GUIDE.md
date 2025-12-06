# Backend API Test Execution Guide

**Date**: December 4, 2025  
**Test Suite**: Comprehensive backend API tests for MineComply  
**Total Tests**: 69 test cases across 5 test files

---

## Quick Start

### Option 1: Run All Tests (Recommended)
```bash
cd minecomplyapi
npm run test:e2e
```

### Option 2: Use Test Scripts

**Windows (PowerShell):**
```powershell
cd minecomplyapi\test
.\run-all-tests.ps1
```

**Linux/Mac (Bash):**
```bash
cd minecomplyapi/test
chmod +x run-all-tests.sh
./run-all-tests.sh
```

---

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file has:
```env
DATABASE_URL=postgresql://...  # Direct connection (not pooler)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...
SUPABASE_STORAGE_BUCKET=minecomplyapp-bucket
SUPABASE_STORAGE_UPLOADS_PATH=uploads/
```

### 2. Database Ready
```bash
npx prisma migrate status
# Should show: "Database schema is up to date!"

npx prisma generate
# Should generate Prisma Client
```

### 3. Dependencies Installed
```bash
npm install
```

### 4. Backend Can Start
```bash
npm run start:dev
# Should start without errors
# Ctrl+C to stop
```

---

## Test Execution Steps

### Step 1: Validate Database Schema ✅
```bash
npx prisma validate
```
**Expected Output:**
```
✔ Prisma schema is valid
```

### Step 2: Check Migration Status ✅
```bash
npx prisma migrate status
```
**Expected Output:**
```
7 migrations found in prisma/migrations
Database schema is up to date!
```

**Should include:**
- `20251204165206_add_quarter_year_and_guest_remarks`

### Step 3: Run CMVR Tests
```bash
npm run test:e2e -- cmvr-quarter-filtering.e2e-spec.ts
```

**Tests (11 total):**
- ✅ Quarter extraction: "1st" → "Q1", "2nd" → "Q2", etc.
- ✅ Year parsing: "2025" → 2025 (integer)
- ✅ Invalid quarter handling
- ✅ Filter by quarter: `GET /cmvr?quarter=Q1`
- ✅ Filter by year: `GET /cmvr?year=2025`
- ✅ Combined filtering
- ✅ Grouped endpoint
- ✅ Empty results for invalid filters

### Step 4: Run Guest Remarks Tests
```bash
npm run test:e2e -- guest-remarks.e2e-spec.ts
```

**Tests (20 total):**
- ✅ Create with all fields
- ✅ Create without email (optional)
- ✅ Anonymous submission
- ✅ Invalid reportType/guestRole rejection
- ✅ Missing required fields rejection
- ✅ Get by report
- ✅ Get count
- ✅ Get single remark
- ✅ SQL injection safety
- ✅ XSS handling
- ✅ Large payload handling

**Note:** 2 tests skipped (require auth token)

### Step 5: Run ECC Tally Tests
```bash
npm run test:e2e -- ecc-tally.e2e-spec.ts
```

**Tests (12 total):**
- ✅ Tally with mixed statuses
- ✅ All complied (100%)
- ✅ Empty conditions
- ✅ Case-insensitive status matching
- ✅ Multiple permit holders
- ✅ PDF structure validation
- ✅ DOCX generation
- ✅ Performance with 500 conditions

### Step 6: Run Document Generation Tests
```bash
npm run test:e2e -- document-generation.e2e-spec.ts
```

**Tests (8 total):**
- ✅ PDF with N/A in YES column only
- ✅ PDF with normal checkmarks
- ✅ Remarks included when N/A
- ✅ DOCX with N/A format
- ✅ PDF and DOCX format matching
- ✅ Missing data error handling
- ✅ Invalid ID handling (404)

### Step 7: Run Integration Tests
```bash
npm run test:e2e -- integration.e2e-spec.ts
```

**Tests (18 total):**
- ✅ Module registration
- ✅ E2E Workflow: CMVR with quarter (5 steps)
- ✅ E2E Workflow: ECC with tally (5 steps)
- ✅ E2E Workflow: Guest remarks (6 steps)
- ✅ Performance: 100 reports < 10s
- ✅ Performance: 50 remarks < 2s
- ✅ Error handling (400, 404, 401)

**Note:** 1 test skipped (require auth token)

---

## Manual Verification Checklist

After automated tests pass, manually verify:

### PDF Document Verification
- [ ] Open a generated CMVR PDF with complaint management N/A
- [ ] Verify "N/A" appears **only in YES column**
- [ ] Verify NO column is **completely empty** (no text, no checkmarks)
- [ ] Verify remarks appear below the table
- [ ] Open a generated ECC PDF
- [ ] Verify tally table appears after each permit holder
- [ ] Verify percentages add up to 100%
- [ ] Verify tally has 5 rows (Complied, Not Complied, Partially, N/A, Total)

### DOCX Document Verification
- [ ] Open a generated CMVR DOCX with complaint management N/A
- [ ] Verify "N/A" in YES column, empty NO column
- [ ] Verify formatting matches PDF
- [ ] Open a generated ECC DOCX
- [ ] Verify tally table uses Word table format
- [ ] Verify header row is bold
- [ ] Verify numbers match PDF exactly

### API Endpoint Verification
- [ ] Visit `http://localhost:3000/api` (Swagger)
- [ ] Verify `/guest-remarks` endpoints are documented
- [ ] Verify `/cmvr?quarter=Q1` works in Swagger UI
- [ ] Test each guest-remarks endpoint in Swagger

### Database Verification
- [ ] Open Prisma Studio: `npx prisma studio`
- [ ] Navigate to `CMVRReport` table
- [ ] Verify `quarter` and `year` columns exist
- [ ] Navigate to `GuestRemark` table
- [ ] Verify all fields present
- [ ] Check indexes tab for proper indexes

---

## Expected Test Duration

| Test Suite | Duration | Test Count |
|------------|----------|------------|
| CMVR Quarter Filtering | ~15 seconds | 11 |
| Guest Remarks CRUD | ~25 seconds | 20 |
| ECC Tally | ~40 seconds | 12 |
| Document Generation | ~30 seconds | 8 |
| Integration | ~60 seconds | 18 |
| **Total** | **~2-3 minutes** | **69** |

*Note: First run may take longer due to Prisma Client generation and database setup*

---

## Interpreting Test Results

### All Tests Pass ✅
```
Test Suites: 5 passed, 5 total
Tests:       66 passed, 3 skipped, 69 total
```

**Action:** Proceed to manual verification

### Some Tests Fail ❌
```
Test Suites: 1 failed, 4 passed, 5 total
Tests:       63 passed, 3 failed, 3 skipped, 69 total
```

**Action:**
1. Review failed test output
2. Check which module failed
3. Verify database connection
4. Check if backend is running (should not be during tests)
5. Review implementation in affected files

### Tests Timeout ⏱️
```
Timeout - Async callback was not invoked within the 5000 ms timeout
```

**Action:**
1. Increase timeout in test file: `it('test name', async () => {...}, 30000)`
2. Or globally in `jest-e2e.json`: `"testTimeout": 30000`
3. Check database performance
4. Verify no infinite loops in implementation

---

## Common Issues & Solutions

### Issue 1: Database Connection Failed
```
Error: Can't reach database server
```

**Solution:**
```bash
# Verify DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection
npx prisma db pull
```

### Issue 2: Migration Not Applied
```
Error: Table 'GuestRemark' does not exist
```

**Solution:**
```bash
npx prisma migrate deploy
npx prisma generate
```

### Issue 3: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Stop any running backend servers
# Or kill the process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue 4: Module Not Found
```
Cannot find module '@nestjs/testing'
```

**Solution:**
```bash
npm install --save-dev @nestjs/testing supertest @types/supertest
```

### Issue 5: Prisma Client Outdated
```
Error: Prisma Client did not initialize yet
```

**Solution:**
```bash
npx prisma generate
```

---

## Test Data Cleanup

All tests automatically clean up after themselves in `afterAll()` hooks. However, if tests are interrupted:

### Manual Cleanup SQL
```sql
-- Remove test CMVR reports
DELETE FROM "CMVRReport" 
WHERE "fileName" LIKE '%Test%' 
   OR "fileName" LIKE '%E2E%'
   OR "fileName" LIKE '%Performance%';

-- Remove test ECC reports
DELETE FROM "ECCReport" 
WHERE "generalInfo"->>'companyName' LIKE '%Test%';

-- Remove test guest remarks
DELETE FROM "GuestRemark" 
WHERE "guestName" LIKE '%Test%' 
   OR "guestName" LIKE '%E2E%';
```

### Using Prisma Studio
1. Open Prisma Studio: `npx prisma studio`
2. Navigate to each table
3. Filter by test-related names
4. Delete records

---

## Continuous Testing

### During Development
```bash
# Run tests in watch mode
npm run test:e2e -- --watch

# Run specific test file in watch mode
npm run test:e2e -- cmvr-quarter-filtering.e2e-spec.ts --watch
```

### Before Committing
```bash
# Run all tests
npm run test:e2e

# Run with coverage
npm run test:cov

# Lint code
npm run lint
```

### In CI/CD Pipeline
```bash
# Full test suite with coverage
npm install
npx prisma generate
npm run test:e2e
npm run lint
```

---

## Test Maintenance

### When Adding New Features
1. Create new test file in `test/` directory
2. Follow naming: `feature-name.e2e-spec.ts`
3. Include test categories:
   - Happy path
   - Error cases
   - Edge cases
   - Performance
   - Security
4. Update `TEST_SUITE_SUMMARY.md`
5. Update this guide with new test count

### When Modifying Existing Features
1. Update corresponding test file
2. Add new test cases for new behavior
3. Ensure backward compatibility tests still pass
4. Update expected values if needed

---

## Additional Resources

- **Test Plan**: `.cursor/plans/backend_api_test_plan_*.plan.md`
- **Implementation Status**: `BUG_FIXES_AND_FEATURES_STATUS.md`
- **Implementation Summary**: `IMPLEMENTATION_COMPLETE.md`
- **Test Suite Summary**: `TEST_SUITE_SUMMARY.md`
- **Test Files**: `minecomplyapi/test/*.e2e-spec.ts`

---

## Success Confirmation

When all tests pass, you should see:

```
PASS test/cmvr-quarter-filtering.e2e-spec.ts
PASS test/guest-remarks.e2e-spec.ts
PASS test/ecc-tally.e2e-spec.ts
PASS test/document-generation.e2e-spec.ts
PASS test/integration.e2e-spec.ts

Test Suites: 5 passed, 5 total
Tests:       66 passed, 3 skipped, 69 total
Snapshots:   0 total
Time:        XX.XXXs

Ran all test suites.
```

**This confirms:**
- ✅ All database schema changes working
- ✅ All API endpoints functional
- ✅ All document generation correct
- ✅ All modules properly registered
- ✅ All security measures in place
- ✅ Performance within acceptable limits

---

## Next Steps After Tests Pass

1. **Deploy to Staging**: Test in staging environment
2. **Manual QA**: Complete manual verification checklist
3. **Integration Testing**: Test with frontend app
4. **Performance Testing**: Test with production-like data volume
5. **Security Audit**: Run additional security scans if needed
6. **Documentation**: Update API documentation with new endpoints
7. **Deploy to Production**: Roll out changes

---

## Support & Troubleshooting

If you encounter issues:
1. Review test output carefully
2. Check database connection and credentials
3. Verify all migrations applied
4. Ensure no backend server running during tests
5. Review implementation files referenced in test failures
6. Check `TEST_SUITE_SUMMARY.md` for detailed test descriptions

For implementation details, see `BUG_FIXES_AND_FEATURES_STATUS.md`.

