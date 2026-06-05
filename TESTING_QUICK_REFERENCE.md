# Backend API Testing - Quick Reference Card

## 🚀 Quick Start

```bash
cd minecomplyapi
npm run test:e2e
```

---

## 📋 Test Files (5)

| File | Tests | Focus |
|------|-------|-------|
| `cmvr-quarter-filtering.e2e-spec.ts` | 11 | Quarter/year extraction & filtering |
| `guest-remarks.e2e-spec.ts` | 20 | Guest remarks CRUD & validation |
| `ecc-tally.e2e-spec.ts` | 12 | ECC tally calculation & docs |
| `document-generation.e2e-spec.ts` | 8 | Complaint N/A handling |
| `integration.e2e-spec.ts` | 18 | E2E workflows & performance |

**Total: 69 test cases**

---

## 🎯 Test Coverage

### Modules Tested
- ✅ CMVR Module (quarter/year, filtering)
- ✅ ECC Module (tally tables, documents)
- ✅ Guest Remarks Module (full CRUD)
- ✅ Document Generation (PDF/DOCX)
- ✅ Integration (E2E workflows)

### Test Categories
- ✅ Happy path scenarios (32 tests)
- ✅ Error handling (15 tests)
- ✅ Validation (12 tests)
- ✅ Security (5 tests)
- ✅ Performance (5 tests)

---

## ⚡ Run Individual Suites

```bash
# CMVR tests (11 tests, ~15s)
npm run test:e2e -- cmvr-quarter-filtering.e2e-spec.ts

# Guest remarks tests (20 tests, ~25s)
npm run test:e2e -- guest-remarks.e2e-spec.ts

# ECC tally tests (12 tests, ~40s)
npm run test:e2e -- ecc-tally.e2e-spec.ts

# Document generation tests (8 tests, ~30s)
npm run test:e2e -- document-generation.e2e-spec.ts

# Integration tests (18 tests, ~60s)
npm run test:e2e -- integration.e2e-spec.ts
```

---

## 🔍 Key Test Scenarios

### CMVR Quarter Filtering
```bash
# Test: Extract quarter from "1st" → "Q1"
POST /cmvr { generalInfo: { quarter: "1st" } }

# Test: Filter by quarter
GET /cmvr?quarter=Q1&year=2025

# Test: Grouped reports
GET /cmvr/grouped-by-quarter?year=2025
```

### Guest Remarks
```bash
# Test: Create remark
POST /guest-remarks {
  reportId: "uuid",
  reportType: "CMVR",
  guestName: "John Doe",
  guestRole: "Member",
  remarks: "Test remark"
}

# Test: Get remarks for report
GET /guest-remarks/report/{reportId}

# Test: Get count
GET /guest-remarks/report/{reportId}/count
```

### ECC Tally
```bash
# Test: Generate PDF with tally
POST /ecc { conditions: [...] }
GET /ecc/{id}/pdf

# Test: Verify tally calculation
# 3 Complied + 2 Not + 1 Partial + 1 N/A = 7 total
# Percentages: 42.9%, 28.6%, 14.3%, 14.3%
```

---

## ✅ Prerequisites Checklist

- [ ] `.env` file configured with DATABASE_URL
- [ ] Dependencies installed: `npm install`
- [ ] Migrations applied: `npx prisma migrate deploy`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Schema valid: `npx prisma validate`
- [ ] Backend can start: `npm run start:dev` (then stop)

---

## 📊 Expected Results

### Success Output
```
Test Suites: 5 passed, 5 total
Tests:       66 passed, 3 skipped, 69 total
Time:        ~2-3 minutes
```

### Performance Benchmarks
- CMVR creation: < 1s
- Quarter filtering: < 500ms
- Guest remark creation: < 300ms
- ECC PDF (500 conditions): < 30s
- Query 100 reports: < 10s
- Query 50 remarks: < 2s

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL in .env |
| Migration not applied | Run `npx prisma migrate deploy` |
| Port in use | Stop backend server |
| Module not found | Run `npm install` |
| Timeout errors | Increase timeout in test file |
| Prisma Client error | Run `npx prisma generate` |

---

## 📝 Manual Verification

After automated tests pass:

1. **Open Prisma Studio**: `npx prisma studio`
   - Check CMVRReport has quarter/year columns
   - Check GuestRemark table exists

2. **Test Swagger UI**: `http://localhost:3000/api`
   - Verify /guest-remarks endpoints listed
   - Test endpoints interactively

3. **Verify PDF/DOCX**:
   - Generate sample documents
   - Check N/A formatting (YES column only)
   - Check ECC tally tables present

---

## 🎯 Test Execution Scripts

**Windows:**
```powershell
cd minecomplyapi\test
.\run-all-tests.ps1
```

**Linux/Mac:**
```bash
cd minecomplyapi/test
chmod +x run-all-tests.sh
./run-all-tests.sh
```

---

## 📚 Documentation

- **Full Test Plan**: `.cursor/plans/backend_api_test_plan_*.plan.md`
- **Test Suite Details**: `minecomplyapi/TEST_SUITE_SUMMARY.md`
- **Execution Guide**: `minecomplyapi/TEST_EXECUTION_GUIDE.md`
- **Test README**: `minecomplyapi/test/README.md`
- **Implementation Status**: `BUG_FIXES_AND_FEATURES_STATUS.md`

---

## ⏱️ Estimated Time

- **Setup**: 5 minutes (if prerequisites met)
- **Test Execution**: 2-3 minutes
- **Manual Verification**: 10 minutes
- **Total**: ~15-20 minutes

---

## ✨ Success Criteria

All tests pass when:
- ✅ 66 tests pass, 3 skipped (auth-required)
- ✅ No linter errors
- ✅ All endpoints return correct status codes
- ✅ Documents generate successfully
- ✅ Performance within benchmarks
- ✅ Security tests pass (SQL injection, XSS)
- ✅ Manual verification confirms formatting

---

**Ready to test? Run:** `npm run test:e2e`

