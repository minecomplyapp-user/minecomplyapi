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

  async create(createCmvrDto: CreateCMVRDto) {
    // Separate the data into proper sections
    const {
      complianceMonitoringReport,
      executiveSummaryOfCompliance,
      createdById,
      ...generalInfoData
    } = createCmvrDto;

    return this.prisma.cMVRReport.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        generalInfo: generalInfoData as unknown as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        executiveSummaryOfCompliance:
          executiveSummaryOfCompliance as unknown as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        complianceMonitoringReport:
          complianceMonitoringReport as unknown as any,
        createdById: createdById,
      },
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

  async generateGeneralInfoPdf(id: string): Promise<Buffer> {
    const cmvrReport = await this.findOne(id);

    if (!cmvrReport.generalInfo) {
      throw new NotFoundException(
        `CMVR Report with ID ${id} has no generalInfo data`,
      );
    }

    return this.pdfGenerator.generateGeneralInfoPdf(
      cmvrReport.generalInfo as CMVRGeneralInfo,
    );
  }
}
