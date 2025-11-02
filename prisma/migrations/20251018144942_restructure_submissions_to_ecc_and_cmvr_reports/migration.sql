/*
  Warnings:

  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Submission";

-- DropEnum
DROP TYPE "SubmissionType";

-- CreateTable
CREATE TABLE "ECCReport" (
    "id" TEXT NOT NULL,
    "generalInfo" JSONB,
    "mmtInfo" JSONB,
    "monitoringData" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ECCReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CMVRReport" (
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

-- CreateIndex
CREATE INDEX "idx_ecc_report_creator" ON "ECCReport"("createdById");

-- CreateIndex
CREATE INDEX "idx_cmvr_report_creator" ON "CMVRReport"("createdById");
