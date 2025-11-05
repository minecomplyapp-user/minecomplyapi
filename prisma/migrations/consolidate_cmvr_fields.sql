-- Migration: Consolidate CMVR fields into single cmvrData column
-- This migration consolidates generalInfo, executiveSummaryOfCompliance, 
-- complianceMonitoringReport, and discussions into a single cmvrData JSON field

BEGIN;

-- Step 1: Add the new cmvrData column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'CMVRReport' 
        AND column_name = 'cmvrData'
    ) THEN
        ALTER TABLE "public"."CMVRReport" 
        ADD COLUMN "cmvrData" jsonb;
    END IF;
END $$;

-- Step 2: Migrate existing data into cmvrData
-- This combines all existing JSON fields into one structure
UPDATE "public"."CMVRReport"
SET "cmvrData" = jsonb_build_object(
    'generalInfo', COALESCE("generalInfo", 'null'::jsonb),
    'executiveSummaryOfCompliance', COALESCE("executiveSummaryOfCompliance", 'null'::jsonb),
    'complianceMonitoringReport', COALESCE("complianceMonitoringReport", 'null'::jsonb),
    'discussions', COALESCE("discussions", 'null'::jsonb)
)
WHERE "cmvrData" IS NULL;

-- Step 3: Drop old columns
-- WARNING: This will permanently delete the old column data
-- Make sure you have a backup before running this!
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "generalInfo";
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "executiveSummaryOfCompliance";
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "complianceMonitoringReport";
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "discussions";

COMMIT;

-- Verification query (run after migration to check):
-- SELECT id, "cmvrData" FROM "public"."CMVRReport" LIMIT 5;
