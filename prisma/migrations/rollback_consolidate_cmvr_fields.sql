-- ROLLBACK Migration: Restore separate CMVR fields from cmvrData
-- WARNING: Only use this if you need to rollback the consolidation
-- This assumes your cmvrData follows the structure created by the forward migration

BEGIN;

-- Step 1: Re-add the old columns
ALTER TABLE "public"."CMVRReport" 
ADD COLUMN IF NOT EXISTS "generalInfo" jsonb,
ADD COLUMN IF NOT EXISTS "executiveSummaryOfCompliance" jsonb,
ADD COLUMN IF NOT EXISTS "complianceMonitoringReport" jsonb,
ADD COLUMN IF NOT EXISTS "discussions" jsonb;

-- Step 2: Extract data from cmvrData back to individual columns
UPDATE "public"."CMVRReport"
SET 
    "generalInfo" = ("cmvrData" -> 'generalInfo'),
    "executiveSummaryOfCompliance" = ("cmvrData" -> 'executiveSummaryOfCompliance'),
    "complianceMonitoringReport" = ("cmvrData" -> 'complianceMonitoringReport'),
    "discussions" = ("cmvrData" -> 'discussions')
WHERE "cmvrData" IS NOT NULL;

-- Step 3: Drop the cmvrData column
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "cmvrData";

COMMIT;

-- Verification query:
-- SELECT id, "generalInfo", "executiveSummaryOfCompliance" FROM "public"."CMVRReport" LIMIT 5;
