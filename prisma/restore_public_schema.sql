-- Restore essential public schema tables for MineComply API
-- Safe to run multiple times; uses IF NOT EXISTS and additive operations.
-- Run this in Supabase SQL editor connected to your project.

-- === Enums required by current models ===
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "public"."UserRole" AS ENUM ('PROPONENT', 'MMT', 'REGULATOR', 'ADMIN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ValidationStatus') THEN
    CREATE TYPE "public"."ValidationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NEEDS_INFORMATION');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ValidationOutcome') THEN
    CREATE TYPE "public"."ValidationOutcome" AS ENUM ('APPROVED', 'CONDITIONALLY_APPROVED', 'REQUIRES_CORRECTION', 'REJECTED', 'NOT_APPLICABLE');
  END IF;
END $$;

-- === User table (required by relations) ===
CREATE TABLE IF NOT EXISTS "public"."User" (
  "id" TEXT NOT NULL,
  "supabaseId" TEXT NOT NULL,
  "email" TEXT,
  "displayName" TEXT,
  "phoneNumber" TEXT,
  "role" "public"."UserRole" NOT NULL DEFAULT 'PROPONENT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseId_key" ON "public"."User" ("supabaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "public"."User" ("email");

-- === Validation tables ===
CREATE TABLE IF NOT EXISTS "public"."ValidationSession" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "status" "public"."ValidationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "summary" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ValidationSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_validation_submission" ON "public"."ValidationSession" ("submissionId");
CREATE INDEX IF NOT EXISTS "idx_validation_reviewer" ON "public"."ValidationSession" ("reviewerId");

CREATE TABLE IF NOT EXISTS "public"."ValidationEntry" (
  "id" TEXT NOT NULL,
  "validationId" TEXT NOT NULL,
  "status" "public"."ValidationOutcome" NOT NULL DEFAULT 'APPROVED',
  "fieldValue" DECIMAL(12,4),
  "fieldUnit" TEXT,
  "comparisonData" JSONB,
  "notes" TEXT,
  "recommendation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ValidationEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_validation_entry_session" ON "public"."ValidationEntry" ("validationId");

-- AttendanceRecord
CREATE TABLE IF NOT EXISTS "public"."AttendanceRecord" (
  "id" TEXT NOT NULL,
  "reportId" TEXT,
  "fileName" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "meetingDate" TIMESTAMP(3),
  "location" TEXT,
  "attendees" JSONB NOT NULL,
  "attachments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdById" TEXT,
  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_attendance_record_report"
  ON "public"."AttendanceRecord" ("reportId");

CREATE INDEX IF NOT EXISTS "idx_attendance_record_creator"
  ON "public"."AttendanceRecord" ("createdById");

-- ECCReport
CREATE TABLE IF NOT EXISTS "public"."ECCReport" (
  "id" TEXT NOT NULL,
  "generalInfo" JSONB,
  "mmtInfo" JSONB,
  "monitoringData" JSONB,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "permit_holders" TEXT[],
  "remarks_list" JSONB,
  "filename" VARCHAR,
  CONSTRAINT "ECCReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_ecc_report_creator"
  ON "public"."ECCReport" ("createdById");

-- CMVRReport
CREATE TABLE IF NOT EXISTS "public"."CMVRReport" (
  "id" TEXT NOT NULL,
  "generalInfo" JSONB,
  "executiveSummaryOfCompliance" JSONB,
  "complianceMonitoringReport" JSONB,
  "discussions" JSONB,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CMVRReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_cmvr_report_creator"
  ON "public"."CMVRReport" ("createdById");

-- ECCCondition (RLS-managed table; minimal structure)
CREATE TABLE IF NOT EXISTS "public"."ECCCondition" (
  "id" BIGSERIAL PRIMARY KEY,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP(6),
  "condition" TEXT,
  "status" VARCHAR,
  "remarks" TEXT,
  "ECCReportID" VARCHAR,
  "nested_to" VARCHAR,
  "condition_number" INTEGER,
  "remark_list" TEXT[],
  "section" SMALLINT NOT NULL
);

-- Optional: create public.profiles minimal structure if missing.
-- Comment out if you manage profiles elsewhere.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    CREATE TABLE "public"."profiles" (
      "id" uuid PRIMARY KEY,
      "email" text UNIQUE,
      "first_name" text,
      "last_name" text,
      "full_name" text,
      "position" text,
      "mailing_address" text,
      "telephone" text,
      "phone_number" text,
      "fax" text,
      "verified" boolean DEFAULT false,
      "created_at" timestamp with time zone DEFAULT now(),
      "updated_at" timestamp with time zone
    );
  END IF;
END$$;

-- Touch updatedAt triggers are omitted here; add if you have them in your SQL scripts.
