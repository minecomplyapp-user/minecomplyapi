-- CreateAttendanceRecord migration with createdById field
-- This migration adds the createdById field to track who created each attendance record

-- Add createdById column to AttendanceRecord table
ALTER TABLE "AttendanceRecord" ADD COLUMN "createdById" TEXT;

-- Create index for performance on createdById lookups
CREATE INDEX "idx_attendance_record_creator" ON "AttendanceRecord"("createdById");

-- Add foreign key constraint to reference User table
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;