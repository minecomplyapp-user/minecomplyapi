import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './dto';
import { AttendancePdfGeneratorService } from './pdf-generator.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: AttendancePdfGeneratorService,
    private readonly storageService: SupabaseStorageService,
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        attachments: (createAttendanceRecordDto.attachments ?? []) as any,
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        attachments: updateAttendanceRecordDto.attachments as any,
      },
    });
  }

  async remove(id: string) {
    const record = await this.findOne(id); // Ensure record exists

    // Delete attachments from Supabase Storage if they exist
    if (record.attachments && Array.isArray(record.attachments)) {
      this.logger.log(
        `Deleting ${record.attachments.length} attachment(s) for attendance record ${id}`,
      );

      for (const attachment of record.attachments) {
        try {
          // Handle both old format (string) and new format ({ path, caption })
          let path: string | null = null;
          if (typeof attachment === 'string') {
            path = attachment;
          } else if (attachment && typeof attachment === 'object') {
            path = (attachment as { path?: string }).path ?? null;
          }

          if (path) {
            await this.storageService.remove(path);
            this.logger.log(`Deleted attachment: ${path}`);
          }
        } catch (error) {
          // Log error but don't fail the entire delete operation
          this.logger.error(
            `Failed to delete attachment: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

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
