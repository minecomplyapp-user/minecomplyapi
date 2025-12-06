import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CMVRPdfGeneratorService,
  CMVRGeneralInfo,
} from './cmvr-pdf-generator.service';
import { CreateCMVRDto } from './dto/create-cmvr.dto';
import { SupabaseStorageService } from '../storage/supabase-storage.service';

@Injectable()
export class CmvrService {
  private readonly logger = new Logger(CmvrService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: CMVRPdfGeneratorService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Flatten nested complianceMonitoringReport to match the structure expected by DOCX/PDF generators.
   * If complianceMonitoringReport exists, merge its properties into the top level.
   */
  private flattenComplianceMonitoringReport(data: any): any {
    if (!data) return data;

    const flattened = { ...data };
    if (flattened.complianceMonitoringReport) {
      // Merge all nested compliance sections into top level
      Object.assign(flattened, flattened.complianceMonitoringReport);
      // Remove the nested object after flattening
      delete flattened.complianceMonitoringReport;
    }
    return flattened;
  }

  async create(createCmvrDto: CreateCMVRDto, fileName?: string) {
    const { createdById, attendanceId, attachments, ...cmvrData } =
      createCmvrDto;

    console.log('=== CREATE CMVR DEBUG ===');
    console.log('Received attachments:', JSON.stringify(attachments, null, 2));
    console.log('Attachments type:', typeof attachments);
    console.log('Is array:', Array.isArray(attachments));

    // Flatten nested structure before saving
    const flattenedData = this.flattenComplianceMonitoringReport(cmvrData);

    // Add attendanceId to the cmvrData JSON if provided
    if (attendanceId) {
      flattenedData.attendanceId = attendanceId;
    }

    // ✅ NEW: Extract quarter and year from generalInfo OR top-level
    const generalInfo = flattenedData.generalInfo;
    let quarter: string | null = null;
    let year: number | null = null;

    // Check generalInfo first
    if (generalInfo) {
      // Extract quarter (may be "1st", "2nd", "3rd", "4th" or "Q1", "Q2", "Q3", "Q4")
      if (generalInfo.quarter) {
        const q = String(generalInfo.quarter).toLowerCase();
        if (q.includes('1') || q === 'first') quarter = 'Q1';
        else if (q.includes('2') || q === 'second') quarter = 'Q2';
        else if (q.includes('3') || q === 'third') quarter = 'Q3';
        else if (q.includes('4') || q === 'fourth') quarter = 'Q4';
      }

      // Extract year
      if (generalInfo.year) {
        year = parseInt(String(generalInfo.year), 10);
        if (isNaN(year)) year = null;
      }
    }

    // Also check top-level fields (for DTO structure)
    if (!quarter && cmvrData.quarter) {
      const q = String(cmvrData.quarter).toLowerCase();
      if (q.includes('1') || q === 'first') quarter = 'Q1';
      else if (q.includes('2') || q === 'second') quarter = 'Q2';
      else if (q.includes('3') || q === 'third') quarter = 'Q3';
      else if (q.includes('4') || q === 'fourth') quarter = 'Q4';
    }

    if (!year && cmvrData.year) {
      year = parseInt(String(cmvrData.year), 10);
      if (isNaN(year)) year = null;
    }

    console.log('✅ Extracted quarter:', quarter, '| year:', year);

    const dataToSave = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cmvrData: flattenedData as unknown as any,
      createdById: createdById,
      fileName: fileName || null,
      attachments: attachments || [],
      quarter: quarter, // ✅ NEW: Store quarter
      year: year, // ✅ NEW: Store year
    };

    console.log('Data being saved to DB:', JSON.stringify(dataToSave, null, 2));

    const result = await this.prisma.cMVRReport.create({
      data: dataToSave as any,
    });

    console.log(
      'Created record attachments:',
      JSON.stringify((result as Record<string, unknown>).attachments, null, 2),
    );

    return result;
  }

  async findOne(id: string) {
    const cmvrReport = await this.prisma.cMVRReport.findUnique({
      where: { id },
    });

    if (!cmvrReport) {
      throw new NotFoundException(`CMVR Report with ID ${id} not found`);
    }

    return cmvrReport;
  }

  async findAll(quarter?: string, year?: number) {
    const where: any = {};
    
    // ✅ NEW: Filter by quarter if provided
    if (quarter) {
      where.quarter = quarter;
    }
    
    // ✅ NEW: Filter by year if provided
    if (year) {
      where.year = year;
    }

    return this.prisma.cMVRReport.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * ✅ NEW: Get reports grouped by quarter and year
   */
  async findByQuarterAndYear(year?: number) {
    const where: any = {};
    if (year) {
      where.year = year;
    }

    const reports = await this.prisma.cMVRReport.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { quarter: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Group by quarter and year
    const grouped: Record<string, Record<string, any[]>> = {};
    
    reports.forEach((report) => {
      const reportYear = report.year || 'Unknown';
      const reportQuarter = report.quarter || 'Unassigned';
      
      if (!grouped[reportYear]) {
        grouped[reportYear] = {};
      }
      
      if (!grouped[reportYear][reportQuarter]) {
        grouped[reportYear][reportQuarter] = [];
      }
      
      grouped[reportYear][reportQuarter].push(report);
    });

    return grouped;
  }

  async findByUserId(userId: string) {
    return this.prisma.cMVRReport.findMany({
      where: {
        createdById: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async generateGeneralInfoPdf(id: string): Promise<Buffer> {
    const cmvrReport = await this.findOne(id);

    if (!cmvrReport.cmvrData) {
      throw new NotFoundException(`CMVR Report with ID ${id} has no cmvrData`);
    }

    // Extract generalInfo from cmvrData
    const cmvrDataObj = cmvrReport.cmvrData as any;
    const generalInfo = cmvrDataObj.generalInfo || cmvrDataObj;

    return this.pdfGenerator.generateGeneralInfoPdf(
      generalInfo as CMVRGeneralInfo,
    );
  }

  async remove(id: string) {
    // Ensure it exists (and respects RLS ownership if applicable)
    const record = await this.findOne(id);
    const attachmentPaths = this.extractAttachmentPaths(
      (record as Record<string, unknown>).attachments,
    );

    const result = await this.prisma.cMVRReport.delete({ where: { id } });

    if (attachmentPaths.length > 0) {
      const uniquePaths = Array.from(new Set(attachmentPaths));
      this.logger.log(
        `Deleting ${uniquePaths.length} attachment(s) for CMVR report ${id}`,
      );
      const deletionResults = await Promise.allSettled(
        uniquePaths.map((path) => this.storageService.remove(path)),
      );

      const failures = deletionResults.filter(
        (res): res is PromiseRejectedResult => res.status === 'rejected',
      );

      if (failures.length > 0) {
        this.logger.warn(
          `Failed to delete ${failures.length} attachment(s) for CMVR report ${id}`,
        );
        failures.forEach((failure) =>
          this.logger.warn(
            failure.reason instanceof Error
              ? failure.reason.message
              : String(failure.reason),
          ),
        );
      }
    }

    return result;
  }

  async duplicate(id: string) {
    const originalReport = await this.findOne(id);

    if (!originalReport) {
      throw new NotFoundException(`CMVR Report with ID ${id} not found`);
    }

    // Extract the data we need to duplicate
    const cmvrData = originalReport.cmvrData as any;
    const attachments = (originalReport as any).attachments || [];

    // Find the next available number for duplication
    const originalFileName = originalReport.fileName || 'CMVR_Report';

    // Remove existing (n) pattern if present
    const cleanFileName = originalFileName.replace(/\s*\(\d+\)\s*$/, '').trim();

    // Find all reports with similar names
    const allReports = await this.prisma.cMVRReport.findMany({
      where: {
        createdById: originalReport.createdById,
      },
      select: {
        fileName: true,
      },
    });

    // Find the highest number used
    let maxNumber = 0;
    const pattern = new RegExp(
      `^${cleanFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\((\\d+)\\)\\s*$`,
    );
    allReports.forEach((report) => {
      const match = report.fileName?.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const nextNumber = maxNumber + 1;
    const duplicateFileName = `${cleanFileName} (${nextNumber})`;

    // Update the fileName in cmvrData if it exists
    const updatedCmvrData = {
      ...cmvrData,
      fileName: duplicateFileName,
    };

    const dataToSave = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cmvrData: updatedCmvrData as unknown as any,
      createdById: originalReport.createdById,
      fileName: duplicateFileName,
      attachments: attachments, // Reuse the same attachment references
    };

    return this.prisma.cMVRReport.create({
      data: dataToSave as any,
    });
  }

  private extractAttachmentPaths(attachments: unknown): string[] {
    if (!Array.isArray(attachments)) {
      return [];
    }

    return attachments
      .map((item) => {
        if (item && typeof item === 'object') {
          const path = (item as { path?: unknown }).path;
          if (typeof path === 'string' && path.trim().length > 0) {
            return path;
          }
        }
        return null;
      })
      .filter((path): path is string => path !== null);
  }

  async update(id: string, updateDto: CreateCMVRDto, fileName?: string) {
    // Ensure record exists and RLS ownership
    await this.findOne(id);
    const {
      createdById: _ignore,
      attendanceId,
      attachments,
      ...cmvrData
    } = updateDto as any;

    console.log('=== UPDATE CMVR DEBUG ===');
    console.log('Received attachments:', JSON.stringify(attachments, null, 2));
    console.log('Attachments type:', typeof attachments);
    console.log('Is array:', Array.isArray(attachments));

    // Flatten nested structure before saving
    const flattenedData = this.flattenComplianceMonitoringReport(cmvrData);

    // Add attendanceId to the cmvrData JSON if provided
    if (attendanceId) {
      flattenedData.attendanceId = attendanceId;
    }

    const dataToUpdate = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cmvrData: flattenedData as unknown as any,
      fileName: fileName || null,
      attachments: attachments || [],
    };

    console.log(
      'Data being updated in DB:',
      JSON.stringify(dataToUpdate, null, 2),
    );

    const result = await this.prisma.cMVRReport.update({
      where: { id },
      data: dataToUpdate as any,
    });

    console.log(
      'Updated record attachments:',
      JSON.stringify((result as Record<string, unknown>).attachments, null, 2),
    );

    return result;
  }
}
