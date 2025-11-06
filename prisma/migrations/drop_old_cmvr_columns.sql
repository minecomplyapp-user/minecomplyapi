-- Drop old separate CMVR columns (since database already has cmvrData)
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop the old columns that are no longer needed
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "generalInfo";
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "executiveSummaryOfCompliance";
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "complianceMonitoringReport";
ALTER TABLE "public"."CMVRReport" DROP COLUMN IF EXISTS "discussions";

COMMIT;

-- Verification query (run after to confirm only cmvrData remains):
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'CMVRReport';
