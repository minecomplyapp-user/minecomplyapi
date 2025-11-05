-- Manual migration: Add optional fileName to public.CMVRReport
-- Safe to run multiple times (checks for column existence)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'CMVRReport'
      AND column_name = 'fileName'
  ) THEN
    ALTER TABLE "public"."CMVRReport" ADD COLUMN "fileName" varchar NULL;
  END IF;
END $$;
