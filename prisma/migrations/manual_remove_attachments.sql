-- Manual migration to remove attachments column from AttendanceRecord
ALTER TABLE "AttendanceRecord" DROP COLUMN IF EXISTS "attachments";
