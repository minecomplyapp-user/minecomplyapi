import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestRemarkDto } from './dto/create-guest-remark.dto';

@Injectable()
export class GuestRemarksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new guest remark
   */
  async create(dto: CreateGuestRemarkDto) {
    return this.prisma.guestRemark.create({
      data: {
        reportId: dto.reportId,
        reportType: dto.reportType,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail || null,
        guestRole: dto.guestRole,
        remarks: dto.remarks,
        createdById: dto.createdById || null,
      },
    });
  }

  /**
   * Get all remarks for a specific report
   */
  async findByReport(reportId: string) {
    return this.prisma.guestRemark.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all remarks for a specific user
   */
  async findByUser(userId: string) {
    return this.prisma.guestRemark.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single remark by ID
   */
  async findOne(id: string) {
    const remark = await this.prisma.guestRemark.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!remark) {
      throw new NotFoundException(`Guest remark with ID ${id} not found`);
    }

    return remark;
  }

  /**
   * Delete a remark (admin only)
   */
  async remove(id: string) {
    const remark = await this.findOne(id); // Throws if not found
    await this.prisma.guestRemark.delete({
      where: { id },
    });
    return { message: 'Guest remark deleted successfully', id };
  }

  /**
   * Get remarks count for a report
   */
  async getReportRemarksCount(reportId: string): Promise<number> {
    return this.prisma.guestRemark.count({
      where: { reportId },
    });
  }
}

