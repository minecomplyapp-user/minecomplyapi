-- AlterTable
ALTER TABLE "CMVRReport" ADD COLUMN     "quarter" VARCHAR,
ADD COLUMN     "year" INTEGER;

-- CreateTable
CREATE TABLE "GuestRemark" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestRole" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "GuestRemark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_guest_remark_report" ON "GuestRemark"("reportId");

-- CreateIndex
CREATE INDEX "idx_guest_remark_creator" ON "GuestRemark"("createdById");

-- CreateIndex
CREATE INDEX "idx_cmvr_quarter_year" ON "CMVRReport"("quarter", "year");
