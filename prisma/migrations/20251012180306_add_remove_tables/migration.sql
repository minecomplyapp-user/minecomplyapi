/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `reportingFrom` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `reportingTo` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `submittedById` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `complianceRecordId` on the `ValidationEntry` table. All the data in the column will be lost.
  - You are about to drop the `ComplianceCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComplianceRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DigitalSignature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Evidence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOrganization` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('ECC_MONITORING', 'CMVR', 'EPEP_AEPEP');

-- DropIndex
DROP INDEX "idx_submission_author";

-- DropIndex
DROP INDEX "idx_submission_project";

-- DropIndex
DROP INDEX "idx_validation_entry_record";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "createdAt",
DROP COLUMN "projectId",
DROP COLUMN "reportingFrom",
DROP COLUMN "reportingTo",
DROP COLUMN "status",
DROP COLUMN "submittedAt",
DROP COLUMN "submittedById",
DROP COLUMN "summary",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "generalInfo" JSONB,
ADD COLUMN     "mmtInfo" JSONB,
ADD COLUMN     "monitoringData" JSONB,
ADD COLUMN     "type" "SubmissionType" NOT NULL;

-- AlterTable
ALTER TABLE "ValidationEntry" DROP COLUMN "complianceRecordId";

-- DropTable
DROP TABLE "ComplianceCondition";

-- DropTable
DROP TABLE "ComplianceRecord";

-- DropTable
DROP TABLE "DigitalSignature";

-- DropTable
DROP TABLE "Evidence";

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectAssignment";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "UserOrganization";
