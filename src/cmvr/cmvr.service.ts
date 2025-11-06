import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CMVRPdfGeneratorService,
  CMVRGeneralInfo,
} from './cmvr-pdf-generator.service';
import { CreateCMVRDto } from './dto/create-cmvr.dto';

@Injectable()
export class CmvrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: CMVRPdfGeneratorService,
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
    const { createdById, attendanceId, ...cmvrData } = createCmvrDto;

    // Flatten nested structure before saving
    const flattenedData = this.flattenComplianceMonitoringReport(cmvrData);

    // Add attendanceId to the cmvrData JSON if provided
    if (attendanceId) {
      (flattenedData as any).attendanceId = attendanceId;
    }

    return this.prisma.cMVRReport.create({
      // Cast to any to allow setting fields that may be pending migration in generated types
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        cmvrData: flattenedData as unknown as any,
        createdById: createdById,
        fileName: fileName || null,
      } as any,
    });
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

  async findAll() {
    return this.prisma.cMVRReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
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
    await this.findOne(id);
    return this.prisma.cMVRReport.delete({ where: { id } });
  }

  async update(id: string, updateDto: CreateCMVRDto, fileName?: string) {
    // Ensure record exists and RLS ownership
    await this.findOne(id);
    const {
      createdById: _ignore,
      attendanceId,
      ...cmvrData
    } = updateDto as any;

    // Flatten nested structure before saving
    const flattenedData = this.flattenComplianceMonitoringReport(cmvrData);

    // Add attendanceId to the cmvrData JSON if provided
    if (attendanceId) {
      (flattenedData as any).attendanceId = attendanceId;
    }

    return this.prisma.cMVRReport.update({
      where: { id },
      // Cast to any while schema/client are in flux
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        cmvrData: flattenedData as unknown as any,
        fileName: fileName || null,
      } as any,
    });
  }
}
