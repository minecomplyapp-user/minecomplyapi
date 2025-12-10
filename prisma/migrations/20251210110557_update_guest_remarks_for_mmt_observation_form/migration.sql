-- AlterTable: Update GuestRemark table to support MMT Observation Form fields
-- This migration adds new fields while maintaining backward compatibility with existing data

-- Step 1: Make existing required fields nullable for backward compatibility
-- Note: These columns may already be nullable, so we use IF EXISTS check
DO $$ 
BEGIN
  -- Drop NOT NULL constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'GuestRemark' AND column_name = 'reportId' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "GuestRemark" ALTER COLUMN "reportId" DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'GuestRemark' AND column_name = 'reportType' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "GuestRemark" ALTER COLUMN "reportType" DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'GuestRemark' AND column_name = 'guestName' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "GuestRemark" ALTER COLUMN "guestName" DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'GuestRemark' AND column_name = 'guestRole' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "GuestRemark" ALTER COLUMN "guestRole" DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'GuestRemark' AND column_name = 'remarks' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "GuestRemark" ALTER COLUMN "remarks" DROP NOT NULL;
  END IF;
END $$;

-- Step 2: Add new Google Form fields (all nullable for backward compatibility)
ALTER TABLE "GuestRemark" 
  ADD COLUMN IF NOT EXISTS "fullName" TEXT,
  ADD COLUMN IF NOT EXISTS "agency" TEXT,
  ADD COLUMN IF NOT EXISTS "agencyOther" TEXT,
  ADD COLUMN IF NOT EXISTS "position" TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfMonitoring" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "siteCompanyMonitored" TEXT,
  ADD COLUMN IF NOT EXISTS "observations" TEXT,
  ADD COLUMN IF NOT EXISTS "issuesConcerns" TEXT,
  ADD COLUMN IF NOT EXISTS "recommendations" TEXT,
  ADD COLUMN IF NOT EXISTS "createdByEmail" TEXT;

-- Step 3: Migrate existing data from legacy fields to new fields
-- Copy guestName to fullName if fullName is null
UPDATE "GuestRemark"
SET "fullName" = "guestName"
WHERE "fullName" IS NULL AND "guestName" IS NOT NULL;

-- Copy remarks to recommendations if recommendations is null
UPDATE "GuestRemark"
SET "recommendations" = "remarks"
WHERE "recommendations" IS NULL AND "remarks" IS NOT NULL;

-- Step 4: Create index for dateOfMonitoring
CREATE INDEX IF NOT EXISTS "idx_guest_remark_date" ON "GuestRemark"("dateOfMonitoring");

