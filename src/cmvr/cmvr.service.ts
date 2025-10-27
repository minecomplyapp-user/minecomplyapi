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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const cmvrReport = await this.prisma.cMVRReport.findUnique({
      where: { id },
    });

    if (!cmvrReport) {
      throw new NotFoundException(`CMVR Report with ID ${id} not found`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return cmvrReport;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.prisma.cMVRReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async generateGeneralInfoPdf(id: string): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cmvrReport = await this.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!cmvrReport.generalInfo) {
      throw new NotFoundException(
        `CMVR Report with ID ${id} has no generalInfo data`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.pdfGenerator.generateGeneralInfoPdf(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      cmvrReport.generalInfo as CMVRGeneralInfo,
    );
  }
}
