import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma,ECCCondition } from '@prisma/client';
import { CreateEccReportDto } from './dto/create-ecc-report.dto';
import { CreateEccConditionDto } from './dto/create-ecc-condition.dto';
import { UpdateConditionDto } from './dto/update-ecc-condition.dto';
import {
  ECCPdfGeneratorService,
} from './ecc-pdf-generator.service';

import { ECCWordGeneratorService } from './ecc-word-generator.service';


@Injectable()
export class EccService {
   constructor(
      private readonly prisma: PrismaService,
      private readonly pdfGenerator: ECCPdfGeneratorService,
      private readonly wordGenerator: ECCWordGeneratorService,
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
    async getEccReportById(reportId: string) {
    
    // 1. AWAIT the report data immediately
    const reportData = await this.prisma.eCCReport.findUnique({
        where: { id: reportId },
    });
    
    // Handle not found case
    if (!reportData) {
        throw new NotFoundException(`ECC Report with ID ${reportId} not found.`);
    }

    // 2. AWAIT the grouped conditions
    const groupedConditions = await this.getGroupedEccConditionsByReportId(reportId);

    // 3. Construct and return the final combined object
    return {
        ...reportData,
        // Using a new field name like 'groupedConditions' is safer and clearer
        conditions: groupedConditions, 
    };
}

    async getGroupedEccConditionsByReportId(reportId: string): Promise<any[][]> {
    // 1. Fetch all conditions for the given report, ordered by section and condition number.
    const conditions = await this.prisma.eCCCondition.findMany({
        where: { ECCReportID: reportId },
        orderBy: [
            { section: 'asc' }, 
            { condition_number: 'asc' }
        ]
    });

    // 2. Group the conditions by the 'section' field into a temporary object map.
    const groupedObject = conditions.reduce((acc, condition) => {
        // Use the section number (converted to string) as the key
        const sectionKey = condition.section?.toString() || 'General'; 

        if (!acc[sectionKey]) {
            acc[sectionKey] = [];
        }
        
        acc[sectionKey].push(condition);
        
        return acc;
    }, {} as Record<string, typeof conditions>);

    // 3. Convert the grouped object into an array of arrays, sorted by section key.
    
    // Get the keys and sort them numerically (important for section order)
    const sortedSectionKeys = Object.keys(groupedObject).sort((a, b) => {
        // Handle the 'General' string key by placing it last (Infinity)
        const numA = Number(a) || Infinity; 
        const numB = Number(b) || Infinity;
        return numA - numB;
    });

    // Map the sorted keys back to their respective arrays of conditions
    const groupedArray = sortedSectionKeys.map(key => groupedObject[key]);

    return groupedArray;
}
    async getEccConditionsByReportId(reportId: string) {
      return this.prisma.eCCCondition.findMany({
        where: { ECCReportID: reportId },
      });
    }


  async generateECCreportPDF(id: string): Promise<Buffer> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const eccReport = await this.findOne(id);

      const eCCConditions =await this.getEccConditionsByReportId(eccReport.id)
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!eccReport.permit_holders) {
        throw new NotFoundException(
          `CMVR Report with ID ${id} has no permitHolder data`,
        );
      }
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return this.pdfGenerator.generateECCreportPDF(eccReport, eCCConditions
      );
    }


    async generateWordReport(id: string): Promise<{ fileName: string; buffer: Buffer }> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const eccReport = await this.findOne(id);

      const eCCConditions =await this.getEccConditionsByReportId(eccReport.id)
  
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!eccReport.permit_holders) {
        throw new NotFoundException(
          `CMVR Report with ID ${id} has no permit_holders data`,
        );
      }
  

    return this.wordGenerator.generateECCreportWord(eccReport, eCCConditions)

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
        permit_holders: (otherReportData as any).permit_holders, 
        
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


    async updateCondition(conditionId: number, updateDto: UpdateConditionDto) {

        const status = updateDto.status ? updateDto.status.toLowerCase() : '';

         let remark: string;
        if(status.includes('compliant') && updateDto.remark_list && updateDto.remark_list.length > 0){
            remark = updateDto.remark_list[0]
        }else if(status.includes('partial') && updateDto.remark_list && updateDto.remark_list.length > 1){
            remark = updateDto.remark_list[1]
        }else if(status.includes('non') && updateDto.remark_list && updateDto.remark_list.length > 2){
            remark = updateDto.remark_list[2]
        }else{
            remark = '';
        }
        // Use `update` to modify an existing condition record
        return this.prisma.eCCCondition.update({
            where: { id: conditionId },
            data: {
                // The spread operator safely applies only the fields present in the DTO
                ...updateDto,
                remarks:remark,
            },
        });
    }

    async addCondition(reportId: string, createDto: CreateEccConditionDto) {
        // Use `create` to add a new condition and link it to the report
        const sectionValue = createDto.section ?? 0; 
        return this.prisma.eCCCondition.create({
          
            data: {
                ...createDto,
                section: sectionValue,
                // Link the new condition to the existing ECCReport
                ECCReportID: String(reportId),
               
            },
        });
    }

 
    async removeCondition(id: number) {
        // Use `delete` to remove a condition record
        try {
            return await this.prisma.eCCCondition.delete({
                where: { id },
            });
        } catch (error) {
            // Handle case where the condition ID doesn't exist
            if (error.code === 'P2025') {
                throw new NotFoundException(`Condition with ID ${id} not found.`);
            }
            throw error;
        }
    }
}

