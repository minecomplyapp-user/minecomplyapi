-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('IN_PERSON', 'ONLINE', 'ABSENT');

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "fileName" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "meetingDate" TIMESTAMP(3),
    "location" TEXT,
    "attendees" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_attendance_record_report" ON "AttendanceRecord"("reportId");
