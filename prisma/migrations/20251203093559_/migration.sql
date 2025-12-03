/*
  Warnings:

  - You are about to drop the column `complianceMonitoringReport` on the `CMVRReport` table. All the data in the column will be lost.
  - You are about to drop the column `discussions` on the `CMVRReport` table. All the data in the column will be lost.
  - You are about to drop the column `executiveSummaryOfCompliance` on the `CMVRReport` table. All the data in the column will be lost.
  - You are about to drop the column `generalInfo` on the `CMVRReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CMVRReport" DROP COLUMN "complianceMonitoringReport",
DROP COLUMN "discussions",
DROP COLUMN "executiveSummaryOfCompliance",
DROP COLUMN "generalInfo",
ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "cmvrData" JSONB,
ADD COLUMN     "fileName" VARCHAR;

-- AlterTable
ALTER TABLE "ECCReport" ADD COLUMN     "filename" VARCHAR,
ADD COLUMN     "permit_holder_with_conditions" JSONB,
ADD COLUMN     "permit_holders" TEXT[],
ADD COLUMN     "recommendations" VARCHAR[],
ADD COLUMN     "remarks_list" JSONB;

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "ComplianceCategory";

-- DropEnum
DROP TYPE "ConditionType";

-- DropEnum
DROP TYPE "EvidenceType";

-- DropEnum
DROP TYPE "OrganizationMembershipRole";

-- DropEnum
DROP TYPE "OrganizationType";

-- DropEnum
DROP TYPE "ProjectAssignmentRole";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateTable
CREATE TABLE "ECCCondition" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condition" VARCHAR,
    "status" VARCHAR,
    "remarks" TEXT,
    "ECCReportID" VARCHAR,
    "nested_to" INTEGER,
    "condition_number" INTEGER,
    "remark_list" TEXT[],
    "section" SMALLINT,

    CONSTRAINT "ECCCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "full_name" TEXT,
    "position" TEXT,
    "mailing_address" TEXT,
    "telephone" TEXT,
    "phone_number" TEXT,
    "fax" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "qr_path" TEXT,
    "qr_public_url" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");
