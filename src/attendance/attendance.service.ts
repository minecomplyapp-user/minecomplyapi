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
        // @ts-ignore - field exists after migration and prisma generate
        attachments: createAttendanceRecordDto.attachments,
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
        // @ts-ignore - field exists after migration and prisma generate
        attachments: updateAttendanceRecordDto.attachments,
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
}
