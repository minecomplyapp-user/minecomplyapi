# Database Migration Instructions

## Adding Quarter & Year Fields to CMVRReport

**Date**: December 4, 2025  
**Migration**: Add `quarter` and `year` fields to `CMVRReport` model

### Prerequisites
- Ensure your `.env` file has the correct `DATABASE_URL` (direct connection, not pooler)
- Ensure the backend server is stopped
- Ensure you have access to the database

### Steps to Apply Migration

1. **Navigate to the API directory**:
   ```bash
   cd minecomplyapi
   ```

2. **Run the migration command**:
   ```bash
   npx prisma migrate dev --name add_quarter_year_to_cmvr_reports
   ```

3. **Verify the migration**:
   ```bash
   npx prisma migrate status
   ```

4. **Generate Prisma Client** (if needed):
   ```bash
   npx prisma generate
   ```

### What This Migration Does

- Adds `quarter` field (nullable string) to store "Q1", "Q2", "Q3", or "Q4"
- Adds `year` field (nullable integer) to store the year (e.g., 2025)
- Creates a compound index on `quarter` and `year` for faster queries
- **Does NOT** affect existing data (fields are nullable)

### Migration SQL Preview

The migration will generate SQL similar to:

```sql
-- AlterTable
ALTER TABLE "CMVRReport" ADD COLUMN "quarter" VARCHAR,
ADD COLUMN "year" INTEGER;

-- CreateIndex
CREATE INDEX "idx_cmvr_quarter_year" ON "CMVRReport"("quarter", "year");
```

### Rollback (if needed)

If something goes wrong:

```bash
npx prisma migrate resolve --rolled-back add_quarter_year_to_cmvr_reports
```

### After Migration

1. Restart your backend server
2. Test the CMVR report creation with quarter selection
3. Verify reports are filterable by quarter in the UI

### Backfilling Existing Data (Optional)

If you have existing CMVR reports and want to assign quarters to them, you can run this SQL after the migration:

```sql
-- Example: Update reports from 2025 Q1 (Jan-Mar)
UPDATE "CMVRReport" 
SET quarter = 'Q1', year = 2025
WHERE "createdAt" BETWEEN '2025-01-01' AND '2025-03-31'
  AND quarter IS NULL;

-- Q2 (Apr-Jun)
UPDATE "CMVRReport" 
SET quarter = 'Q2', year = 2025
WHERE "createdAt" BETWEEN '2025-04-01' AND '2025-06-30'
  AND quarter IS NULL;

-- Q3 (Jul-Sep)
UPDATE "CMVRReport" 
SET quarter = 'Q3', year = 2025
WHERE "createdAt" BETWEEN '2025-07-01' AND '2025-09-30'
  AND quarter IS NULL;

-- Q4 (Oct-Dec)
UPDATE "CMVRReport" 
SET quarter = 'Q4', year = 2025
WHERE "createdAt" BETWEEN '2025-10-01' AND '2025-12-31'
  AND quarter IS NULL;
```

### Troubleshooting

**Error: Can't reach database server**
- Check your `DATABASE_URL` in `.env`
- Use the direct connection string, not the pooler connection

**Error: Migration already exists**
- The migration may have already been applied
- Check with `npx prisma migrate status`

**Error: Database is locked**
- Close all connections to the database
- Stop the backend server
- Try again

### Next Steps After Successful Migration

1. ✅ Schema updated
2. ➡️ Update CMVR service to save quarter/year
3. ➡️ Update frontend to display quarter filter
4. ➡️ Update storage service for quarterly folders

