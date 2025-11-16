import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './dto';
import { AttendancePdfGeneratorService } from './pdf-generator.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: AttendancePdfGeneratorService,
  ) {}

  async create(createAttendanceRecordDto: CreateAttendanceRecordDto) {
    return this.prisma.attendanceRecord.create({
      data: {
        fileName: createAttendanceRecordDto.fileName,
        title: createAttendanceRecordDto.title,
        description: createAttendanceRecordDto.description,
        meetingDate: createAttendanceRecordDto.meetingDate
          ? new Date(createAttendanceRecordDto.meetingDate)
          : null,
        location: createAttendanceRecordDto.location,
        reportId: createAttendanceRecordDto.reportId,
        createdById: createAttendanceRecordDto.createdById,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        attendees: createAttendanceRecordDto.attendees as any,
      },
    });
  }

  async findAll(reportId?: string) {
    const where = reportId ? { reportId } : {};
    return this.prisma.attendanceRecord.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const attendanceRecord = await this.prisma.attendanceRecord.findUnique({
      where: { id },
    });

    if (!attendanceRecord) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    return attendanceRecord;
  }

  async update(
    id: string,
    updateAttendanceRecordDto: UpdateAttendanceRecordDto,
  ) {
    await this.findOne(id); // Ensure record exists

    return this.prisma.attendanceRecord.update({
      where: { id },
      data: {
        fileName: updateAttendanceRecordDto.fileName,
        title: updateAttendanceRecordDto.title,
        description: updateAttendanceRecordDto.description,
        meetingDate: updateAttendanceRecordDto.meetingDate
          ? new Date(updateAttendanceRecordDto.meetingDate)
          : undefined,
        location: updateAttendanceRecordDto.location,
        reportId: updateAttendanceRecordDto.reportId,
        createdById: updateAttendanceRecordDto.createdById,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        attendees: updateAttendanceRecordDto.attendees as any,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure record exists

    return this.prisma.attendanceRecord.delete({
      where: { id },
    });
  }

  async findByReport(reportId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { reportId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async generatePdf(id: string): Promise<Buffer> {
    const attendanceRecord = await this.findOne(id);
    return this.pdfGenerator.generateAttendancePdf(attendanceRecord);
  }

  async duplicate(id: string) {
    const originalRecord = await this.findOne(id);

    if (!originalRecord) {
      throw new NotFoundException(`Attendance record with ID ${id} not found`);
    }

    // Find the next available number for duplication
    const baseFileName = originalRecord.fileName || 'attendance';
    const baseTitle = originalRecord.title || 'Untitled';

    // Remove existing (n) pattern if present
    const cleanFileName = baseFileName.replace(/\s*\(\d+\)\s*$/, '').trim();
    const cleanTitle = baseTitle.replace(/\s*\(\d+\)\s*$/, '').trim();

    // Find all records with similar names
    const allRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        createdById: originalRecord.createdById,
      },
      select: {
        fileName: true,
        title: true,
      },
    });

    // Find the highest number used
    let maxNumber = 0;
    const pattern = new RegExp(
      `^${cleanFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\((\\d+)\\)\\s*$`,
    );
    allRecords.forEach((record) => {
      const match = record.fileName?.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const nextNumber = maxNumber + 1;

    // Create a copy with incremental numbering
    const duplicateData = {
      fileName: `${cleanFileName} (${nextNumber})`,
      title: `${cleanTitle} (${nextNumber})`,
      description: originalRecord.description,
      meetingDate: originalRecord.meetingDate,
      location: originalRecord.location,
      reportId: originalRecord.reportId,
      createdById: originalRecord.createdById,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      attendees: originalRecord.attendees as any,
    };

    return this.prisma.attendanceRecord.create({
      data: duplicateData,
    });
  }
}
