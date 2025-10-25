import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma,ECCCondition } from '@prisma/client';
import { CreateEccReportDto } from './dto/create-ecc-report.dto';
import { CreateEccConditionDto } from './dto/create-ecc-condition.dto';
import {
  ECCPdfGeneratorService,
} from './ecc-pdf-generator.service';


@Injectable()
export class EccService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly pdfGenerator: ECCPdfGeneratorService,
    ) {}
  
    async findOne(id: string) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const cmvrReport = await this.prisma.eCCReport.findUnique({
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
      return this.prisma.eCCReport.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    }


  async generateECCreportPDF(id: string): Promise<Buffer> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const eccReport = await this.findOne(id);

      const eCCConditions = await this.prisma.eCCCondition.findMany({
        where: { ECCReportID: eccReport.id },
      });
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!eccReport.permitHolder) {
        throw new NotFoundException(
          `CMVR Report with ID ${id} has no permitHolder data`,
        );
      }
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return this.pdfGenerator.generateECCreportPDF(eccReport, eCCConditions
      );
    }
async createEccReport(createEccReportDto: CreateEccReportDto) {
    // 1. Destructure DTO: Separate relation IDs, the nested array, and the rest of the data.
    const { 
        // createdById, 
        conditions, 
        ...otherReportData 
    } = createEccReportDto;
    
    // Prepare the scalar data for the main report creation.
    // We explicitly map permitHolder/permit_holder here due to the known casing mismatch.
    const eccReportData: Prisma.ECCReportUncheckedCreateInput = {
        ...(otherReportData as Prisma.ECCReportUncheckedCreateInput),
        
        // FIX: Explicitly map the camelCase DTO field to the snake_case DB field
        //      This assumes the DB column is 'permit_holder' (snake_case)
        permitHolder: (otherReportData as any).permitHolder, 
        
        // Use the relation syntax for the User creator
        // createdBy: createdById 
        //     ? { connect: { id: createdById } } 
        //     : undefined,
    };

    // 2. Start a transaction to ensure all writes succeed or none do.
    const result = await this.prisma.$transaction(async (prisma) => {
        
        // 3. Create the parent ECC Report record.
        const newEccReport = await prisma.eCCReport.create({
            data: eccReportData,
        });
        console.log('Created ECC Report:', newEccReport);

        const newConditions: ECCCondition[] = [];
        if (conditions && conditions.length > 0) {
            // 4. Loop and create child ECCCondition records individually.
            for (const conditionDto of conditions) {
                
                const newCondition = await prisma.eCCCondition.create({
                    data: {
                        // Set the foreign key using the newly created report's ID
                        ECCReportID: newEccReport.id,
                        
                        // Spread all condition data from the DTO
                        ...(conditionDto as Prisma.ECCConditionUncheckedCreateInput),
                    },
                });
                newConditions.push(newCondition);
            }
        }
        
        // 5. Return both the parent report and the created conditions.
        return {
            ...newEccReport,
            conditions: newConditions,
        };
    });

    return result; 
}
}

