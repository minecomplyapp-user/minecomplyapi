import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

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
        attendees: createAttendanceRecordDto.attendees as unknown as any,
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
        attendees: updateAttendanceRecordDto.attendees as unknown as any,
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
}
