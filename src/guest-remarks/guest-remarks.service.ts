import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestRemarkDto } from './dto/create-guest-remark.dto';

@Injectable()
export class GuestRemarksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new guest remark
   * Supports both legacy format and new Google Form format
   */
  async create(dto: CreateGuestRemarkDto) {
    // Convert dateOfMonitoring string to Date if provided
    let dateOfMonitoringDate: Date | null = null;
    if (dto.dateOfMonitoring) {
      try {
        dateOfMonitoringDate = new Date(dto.dateOfMonitoring);
        // Validate the date
        if (isNaN(dateOfMonitoringDate.getTime())) {
          dateOfMonitoringDate = null;
        }
      } catch (error) {
        console.warn('Invalid dateOfMonitoring format:', dto.dateOfMonitoring);
        dateOfMonitoringDate = null;
      }
    }

    return this.prisma.guestRemark.create({
      data: {
        // Legacy fields (for backward compatibility)
        reportId: dto.reportId || null,
        reportType: dto.reportType || null,
        guestName: dto.guestName || dto.fullName || null, // Fallback to fullName if guestName not provided
        guestEmail: dto.guestEmail || null,
        guestRole: dto.guestRole || null,
        remarks: dto.remarks || dto.recommendations || null, // Fallback to recommendations if remarks not provided
        // ✅ NEW: Google Form fields
        fullName: dto.fullName || dto.guestName || null, // Use fullName, fallback to guestName for legacy
        agency: dto.agency || null,
        agencyOther: dto.agencyOther || null,
        position: dto.position || null,
        dateOfMonitoring: dateOfMonitoringDate,
        siteCompanyMonitored: dto.siteCompanyMonitored || null,
        observations: dto.observations || null,
        issuesConcerns: dto.issuesConcerns || null,
        recommendations: dto.recommendations || dto.remarks || null, // Use recommendations, fallback to remarks for legacy
        // Metadata
        createdById: dto.createdById || null,
        createdByEmail: dto.createdByEmail || null,
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

