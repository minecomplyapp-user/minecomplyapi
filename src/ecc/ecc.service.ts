import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ECCCondition } from '@prisma/client';
import { CreateEccReportDto } from './dto/create-ecc-report.dto';
import { CreateEccConditionDto } from './dto/create-ecc-condition.dto';
import { UpdateConditionDto } from './dto/update-ecc-condition.dto';
import { ECCPdfGeneratorService } from './ecc-pdf-generator.service';

import { ECCWordGeneratorService } from './ecc-word-generator.service';
import { Console } from 'console';

@Injectable()
export class EccService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: ECCPdfGeneratorService,
    private readonly wordGenerator: ECCWordGeneratorService,
  ) {}

  async findOne(id: string) {
    const eccReport = await this.prisma.eCCReport.findUnique({
      where: { id },
    });

    if (!eccReport) {
      throw new NotFoundException(`ECC Report with ID ${id} not found`);
    }

    return eccReport;
  }
  async findAll(createdById) {
    const rawReports = await this.prisma.eCCReport.findMany({
      where: {
        // <--- ADD THIS where CLAUSE
        createdById: createdById, // <--- FILTER BY the createdById passed to the function
      },
      select: {
        id: true, // Select the top-level ID
        generalInfo: true, // Select the entire generalInfo JSON object
        createdAt: true, // Select createdAt for sorting, though not needed in final output
        filename: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map the results to the desired structure
    return rawReports.map((report) => ({
      id: report.id,
      // Extract properties from the generalInfo object
      title: report.filename,
      date: (report.generalInfo as any)?.date,
      attendees: 0,
      type: 'ecc',
      // Note: You must ensure these properties exist on generalInfo before accessing them
    }));
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
    const data = reportData;
    let permit_holder_with_conditions = (reportData as any)
      .permit_holder_with_conditions;

    // If the value is a string, parse it into an object
    if (typeof permit_holder_with_conditions === 'string') {
      permit_holder_with_conditions = JSON.parse(permit_holder_with_conditions);
    }

    // Now TypeScript still thinks it's unknown — so cast it:
    const permitHolders = permit_holder_with_conditions?.permit_holders;

    reportData.generalInfo;
    const formattedPermitHolders = permitHolders.map((holder) => {
      const conditions = holder.monitoringState?.formatted?.conditions ?? [];

      const monitoringState = conditions.map((cond) => ({
        id: String(cond.condition_number),
        title: cond.condition,
        descriptions: {
          complied: cond.remark_list?.[0] ?? '',
          partial: cond.remark_list?.[1] ?? '',
          not: cond.remark_list?.[2] ?? '',
        },
        isDefault: true,
        nested_to: cond.nested_to ? String(cond.nested_to) : null,
      }));

      const asd = {
        id: holder.id,
        name: holder.name,
        type: holder.type,
        monitoringState,
      };
      console.log('asdadadasdsd' + asd);

      return {
        id: holder.id,
        name: holder.name,
        type: holder.type,
        monitoringState,
      };
    });
    console.log('FORMATTEDDDD', formattedPermitHolders);
    // 3. Construct and return the final combined object
    return {
      generalInfo: data.generalInfo,
      mmtInfo: data.mmtInfo,
      permit_holders: formattedPermitHolders,
    };
  }

  async getGroupedEccConditionsByReportId(reportId: string): Promise<any[][]> {
    // 1. Fetch all conditions for the given report, ordered by section and condition number.
    const conditions = await this.prisma.eCCCondition.findMany({
      where: { ECCReportID: reportId },
      orderBy: [{ section: 'asc' }, { condition_number: 'asc' }],
    });

    // 2. Group the conditions by the 'section' field into a temporary object map.
    const groupedObject = conditions.reduce(
      (acc, condition) => {
        // Use the section number (converted to string) as the key
        const sectionKey = condition.section?.toString() || 'General';

        if (!acc[sectionKey]) {
          acc[sectionKey] = [];
        }

        acc[sectionKey].push(condition);

        return acc;
      },
      {} as Record<string, typeof conditions>,
    );

    // 3. Convert the grouped object into an array of arrays, sorted by section key.

    // Get the keys and sort them numerically (important for section order)
    const sortedSectionKeys = Object.keys(groupedObject).sort((a, b) => {
      // Handle the 'General' string key by placing it last (Infinity)
      const numA = Number(a) || Infinity;
      const numB = Number(b) || Infinity;
      return numA - numB;
    });

    // Map the sorted keys back to their respective arrays of conditions
    const groupedArray = sortedSectionKeys.map((key) => groupedObject[key]);

    return groupedArray;
  }
  async getEccConditionsByReportId(reportId: string) {
    return this.prisma.eCCCondition.findMany({
      where: { ECCReportID: reportId },
    });
  }

  async generateECCreportPDF(id: string): Promise<Buffer> {
    const eccReport = await this.findOne(id);

    const eCCConditions = await this.getEccConditionsByReportId(eccReport.id);

    if (!eccReport.permit_holders) {
      throw new NotFoundException(
        `CMVR Report with ID ${id} has no permitHolder data`,
      );
    }

    return this.pdfGenerator.generateECCreportPDF(eccReport, eCCConditions);
  }

  async generateWordReport(
    id: string,
  ): Promise<{ fileName: string; buffer: Buffer }> {
    const eccReport = await this.findOne(id);

    const eCCConditions = await this.getEccConditionsByReportId(eccReport.id);

    if (!eccReport.permit_holders) {
      throw new NotFoundException(
        `CMVR Report with ID ${id} has no permit_holders data`,
      );
    }

    return this.wordGenerator.generateECCreportWord(eccReport, eCCConditions);
  }

  // C:\Users\Nico\Documents\COMMI\2\minecomplyapi\src\ecc\ecc.service.ts

  async createEccReport(createEccReportDto: CreateEccReportDto) {
    // 1. Destructure DTO: Separate relation IDs, the nested array, and the rest of the data.
    const {
      // createdById, // Assuming this is commented out in your actual code
      conditions,
      ...otherReportData
    } = createEccReportDto;

    // Prepare the scalar data for the main report creation.
    const eccReportData: Prisma.ECCReportUncheckedCreateInput = {
      ...(otherReportData as Prisma.ECCReportUncheckedCreateInput),

      // FIX: Explicitly map the permit_holders field
      permit_holders: (otherReportData as any).permit_holders,
    };

    // 2. Start a transaction to ensure all writes succeed or none do.
    const result = await this.prisma.$transaction(
      async (tx) => {
        // 3. Create the parent ECC Report record.
        const newEccReport = await tx.eCCReport.create({
          data: eccReportData,
        });
        console.log('Created ECC Report:', newEccReport);

        let newConditions: ECCCondition[] = [];

        if (conditions && conditions.length > 0) {
          // 4. OPTIMIZATION: Use Promise.all to run all creation promises concurrently.
          //    This is significantly faster than a sequential 'for' loop with 'await'.

          const conditionCreationPromises = conditions.map((conditionDto) => {
            return tx.eCCCondition.create({
              data: {
                // Set the foreign key using the newly created report's ID
                ECCReportID: newEccReport.id,

                // Spread all condition data from the DTO
                ...(conditionDto as Prisma.ECCConditionUncheckedCreateInput),
              },
            });
          });

          // Wait for all conditions to be created concurrently within the transaction
          newConditions = await Promise.all(conditionCreationPromises);
        }
        // 5. Return both the parent report and the created conditions.
        return {
          ...newEccReport,
          conditions: newConditions,
        };
      },
      {
        timeout: 150000,
      },
    );

    return result;
  }

  async updateCondition(conditionId: number, updateDto: UpdateConditionDto) {
    const status = updateDto.status ? updateDto.status.toLowerCase() : '';

    let remark: string;
    if (
      status.includes('compliant') &&
      updateDto.remark_list &&
      updateDto.remark_list.length > 0
    ) {
      remark = updateDto.remark_list[0];
    } else if (
      status.includes('partial') &&
      updateDto.remark_list &&
      updateDto.remark_list.length > 1
    ) {
      remark = updateDto.remark_list[1];
    } else if (
      status.includes('non') &&
      updateDto.remark_list &&
      updateDto.remark_list.length > 2
    ) {
      remark = updateDto.remark_list[2];
    } else {
      remark = '';
    }
    // Use `update` to modify an existing condition record
    return this.prisma.eCCCondition.update({
      where: { id: conditionId },
      data: {
        // The spread operator safely applies only the fields present in the DTO
        ...updateDto,
        remarks: remark,
      },
    });
  }

  async addCondition(reportId: string, createDto: CreateEccConditionDto) {
    // Use `create` to add a new condition and link it to the report
    const sectionValue = createDto.section ?? 0;

    // Convert nested_to to number if it's a string
    const nestedTo = createDto.nested_to
      ? typeof createDto.nested_to === 'string'
        ? parseInt(createDto.nested_to, 10)
        : createDto.nested_to
      : undefined;

    return this.prisma.eCCCondition.create({
      data: {
        condition: createDto.condition,
        status: createDto.status,
        remarks: createDto.remarks,
        remark_list: createDto.remark_list,
        condition_number: createDto.condition_number,
        section: sectionValue,
        nested_to: nestedTo,
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

  async createEccAndGenerateDocs(
    createEccReportDto: CreateEccReportDto,
  ): Promise<{ download_url: string }> {
    // 1. Create the report and all nested conditions.
    // The result contains the parent report object (including its ID) and the conditions array.
    const createdReport = await this.createEccReport(createEccReportDto);

    // 2. Safely extract the ID of the newly created report.
    const reportId = createdReport.id;
    const download_url = `ecc/generateEccWord/${reportId}`;
    console.log(download_url);
    // 3. Generate the Word document using the ID.
    // Assuming generateWordReport is responsible for fetching data and creating the file.
    return { download_url: download_url };
  }

  async duplicate(id: string) {
    const originalReport = await this.findOne(id);

    if (!originalReport) {
      throw new NotFoundException(`ECC Report with ID ${id} not found`);
    }

    // Get all conditions associated with this report
    const originalConditions = await this.getEccConditionsByReportId(id);

    // Find the next available number for duplication
    const originalFilename = originalReport.filename || 'ECC_Report';

    // Remove existing (n) pattern if present
    const cleanFilename = originalFilename.replace(/\s*\(\d+\)\s*$/, '').trim();

    // Find all reports with similar names
    const allReports = await this.prisma.eCCReport.findMany({
      where: {
        createdById: originalReport.createdById,
      },
      select: {
        filename: true,
      },
    });

    // Find the highest number used
    let maxNumber = 0;
    const pattern = new RegExp(
      `^${cleanFilename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\((\\d+)\\)\\s*$`,
    );
    allReports.forEach((report) => {
      const match = report.filename?.match(pattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const nextNumber = maxNumber + 1;
    const duplicateFilename = `${cleanFilename} (${nextNumber})`;

    // Create a duplicate with copied data
    const duplicateReportData = {
      generalInfo: originalReport.generalInfo,
      mmtInfo: originalReport.mmtInfo,
      permit_holder_with_conditions:
        originalReport.permit_holder_with_conditions,
      createdById: originalReport.createdById,
      filename: duplicateFilename,
    };

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(
      async (tx) => {
        // Create the duplicate report
        const newReport = await tx.eCCReport.create({
          data: duplicateReportData as any,
        });

        // Duplicate all conditions if they exist
        if (originalConditions && originalConditions.length > 0) {
          const conditionCreationPromises = originalConditions.map(
            (condition) => {
              return tx.eCCCondition.create({
                data: {
                  ECCReportID: newReport.id,
                  condition: condition.condition,
                  status: condition.status,
                  remarks: condition.remarks,
                  remark_list: condition.remark_list,
                  condition_number: condition.condition_number,
                  section: condition.section,
                  nested_to: condition.nested_to,
                },
              });
            },
          );

          await Promise.all(conditionCreationPromises);
        }

        return newReport;
      },
      {
        timeout: 150000,
      },
    );
  }
}
