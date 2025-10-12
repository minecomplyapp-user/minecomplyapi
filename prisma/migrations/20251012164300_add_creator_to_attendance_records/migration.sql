-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN     "createdById" TEXT;

-- CreateIndex
CREATE INDEX "idx_attendance_record_creator" ON "AttendanceRecord"("createdById");
