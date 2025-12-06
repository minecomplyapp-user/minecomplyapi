# Backend API Test Suite

This directory contains comprehensive end-to-end (e2e) tests for all backend API changes implemented in the MineComply system.

## Test Files

### 1. `cmvr-quarter-filtering.e2e-spec.ts`
Tests CMVR quarter/year extraction and filtering functionality.

**Coverage:**
- Quarter extraction (1st, 2nd, 3rd, 4th → Q1, Q2, Q3, Q4)
- Year parsing and storage
- Quarter-only filtering
- Year-only filtering
- Combined quarter and year filtering
- Grouped reports by quarter endpoint

**Test Count:** 11 tests

### 2. `guest-remarks.e2e-spec.ts`
Tests the complete Guest Remarks CRUD API.

**Coverage:**
- Create remarks (with/without email, anonymous, authenticated)
- Get remarks by report
- Get remarks count
- Get single remark
- Delete remark (auth required)
- Input validation (SQL injection, XSS, large payloads)
- Invalid reportType/guestRole rejection

**Test Count:** 20 tests

### 3. `ecc-tally.e2e-spec.ts`
Tests ECC tally calculation and document generation.

**Coverage:**
- Tally calculation with mixed statuses
- All complied scenarios
- Empty conditions handling
- Case-insensitive status matching
- PDF generation with multiple permit holders
- DOCX generation with tally tables
- Performance with complex reports (500 conditions)

**Test Count:** 12 tests

### 4. `document-generation.e2e-spec.ts`
Tests complaint management N/A handling in documents.

**Coverage:**
- PDF generation with N/A in YES column only
- DOCX generation with N/A in YES column only
- Normal checkmark generation when naForAll is false
- Remarks inclusion when N/A is selected
- PDF and DOCX format matching
- Error handling for missing data

**Test Count:** 8 tests

### 5. `integration.e2e-spec.ts`
Tests end-to-end workflows and module registration.

**Coverage:**
- Module registration verification
- E2E workflow: CMVR with quarter (5 steps)
- E2E workflow: ECC with tally (5 steps)
- E2E workflow: Guest remarks (6 steps)
- Performance tests (100+ reports, 50+ remarks)
- Error handling (invalid UUIDs, 404s, 401s)

**Test Count:** 18 tests

---

## Total Test Coverage

- **Total Test Files:** 5
- **Total Test Cases:** 69
- **Modules Covered:** CMVR, ECC, Guest Remarks, Document Generation
- **Integration Tests:** 16
- **Performance Tests:** 3
- **Security Tests:** 5

---

## Prerequisites

1. **Database:** PostgreSQL (Supabase) connection configured
2. **Environment:** `.env` file with valid credentials
3. **Dependencies:** All npm packages installed
4. **Migrations:** All Prisma migrations applied

```bash
cd minecomplyapi
npm install
npx prisma migrate deploy
npx prisma generate
```

---

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npm run test:e2e -- cmvr-quarter-filtering.e2e-spec.ts
npm run test:e2e -- guest-remarks.e2e-spec.ts
npm run test:e2e -- ecc-tally.e2e-spec.ts
npm run test:e2e -- document-generation.e2e-spec.ts
npm run test:e2e -- integration.e2e-spec.ts
```

### Run Tests in Watch Mode
```bash
npm run test:e2e -- --watch
```

### Run Tests with Coverage
```bash
npm run test:cov
```

---

## Test Execution Order

For comprehensive testing, execute in this order:

1. **Database Validation** (Manual)
   ```bash
   npx prisma validate
   npx prisma migrate status
   ```

2. **CMVR Module Tests**
   ```bash
   npm run test:e2e -- cmvr-quarter-filtering.e2e-spec.ts
   ```

3. **Guest Remarks Module Tests**
   ```bash
   npm run test:e2e -- guest-remarks.e2e-spec.ts
   ```

4. **ECC Tally Tests**
   ```bash
   npm run test:e2e -- ecc-tally.e2e-spec.ts
   ```

5. **Document Generation Tests**
   ```bash
   npm run test:e2e -- document-generation.e2e-spec.ts
   ```

6. **Integration Tests**
   ```bash
   npm run test:e2e -- integration.e2e-spec.ts
   ```

---

## Expected Results

### Success Criteria

✅ All database migrations applied successfully  
✅ All API endpoints return expected status codes  
✅ All document generation produces valid PDF/DOCX files  
✅ No authorization bypasses  
✅ No data leaks between users  
✅ All error cases handled gracefully  
✅ Response times within acceptable limits  
✅ Input validation prevents SQL injection and XSS  

### Performance Benchmarks

- CMVR creation: < 1 second
- Quarter filtering: < 500ms
- Guest remark creation: < 300ms
- ECC PDF generation (500 conditions): < 30 seconds
- Query 100+ reports: < 2 seconds

---

## Skipped Tests

Some tests are marked with `.skip()` because they require:

1. **Valid Supabase Auth Tokens**
   - `GET /guest-remarks/user/:userId`
   - `DELETE /guest-remarks/:id`
   
   To enable these tests:
   - Set up test user in Supabase
   - Obtain valid JWT token
   - Replace `authToken` variable in test files

2. **Swagger Documentation**
   - `GET /api` endpoint verification
   
   To enable:
   - Ensure Swagger module is configured
   - Update base URL if needed

---

## Manual Verification Required

Due to the complexity of parsing PDF and DOCX files, some verifications require manual inspection:

### PDF Content Verification
1. Open generated PDF files
2. Verify:
   - "N/A" appears in YES column only (when naForAll is true)
   - NO column is empty (no checkmarks, no "N/A")
   - Remarks are included
   - Tally tables show correct percentages
   - Multiple permit holders have separate tally tables

### DOCX Content Verification
1. Open generated DOCX files
2. Verify:
   - Same formatting as PDF
   - Tally table uses proper Word table format
   - Numbers match PDF exactly
   - Header rows are bold

---

## Debugging Failed Tests

### Database Connection Issues
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
npx prisma db pull
```

### Migration Issues
```bash
# Check migration status
npx prisma migrate status

# Reset and re-apply
npx prisma migrate reset
npx prisma migrate deploy
```

### Port Conflicts
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Change port in test if needed
```

### Test Timeout
```bash
# Increase timeout in package.json
"test:e2e": "jest --config ./test/jest-e2e.json --timeout=60000"
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd minecomplyapi && npm install
      - run: cd minecomplyapi && npx prisma generate
      - run: cd minecomplyapi && npm run test:e2e
    env:
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

---

## Contributing

When adding new features to the backend:

1. **Create test file** in `test/` directory
2. **Follow naming convention**: `feature-name.e2e-spec.ts`
3. **Include test categories**:
   - Happy path scenarios
   - Error handling
   - Edge cases
   - Performance benchmarks
4. **Update this README** with new test coverage
5. **Run all tests** before submitting PR

---

## Test Data Cleanup

All tests include `afterAll()` or `afterEach()` hooks to clean up test data:
- CMVR reports are deleted after tests
- ECC reports are deleted after tests
- Guest remarks are deleted after tests
- No orphaned data should remain in database

To manually clean test data:
```sql
DELETE FROM "CMVRReport" WHERE "fileName" LIKE '%Test%';
DELETE FROM "ECCReport" WHERE "generalInfo"->>'companyName' LIKE '%Test%';
DELETE FROM "GuestRemark" WHERE "guestName" LIKE '%Test%';
```

---

## Support

For issues with tests:
1. Check the detailed test logs
2. Verify database connection and migrations
3. Ensure all environment variables are set
4. Check that the backend server can start successfully
5. Review individual test comments for specific requirements

For questions about test implementation, refer to:
- `BUG_FIXES_AND_FEATURES_STATUS.md` - Implementation details
- `IMPLEMENTATION_COMPLETE.md` - Feature overview
- Test plan file in `.cursor/plans/` directory

