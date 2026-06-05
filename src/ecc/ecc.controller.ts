import { EccService } from './ecc.service';
import { CreateEccReportDto } from './dto/create-ecc-report.dto';
import { UpdateConditionDto } from './dto/update-ecc-condition.dto';
import { CreateEccConditionDto } from './dto/create-ecc-condition.dto';

import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Res,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ECCPdfGeneratorService } from './ecc-pdf-generator.service';

import { ECCWordGeneratorService } from './ecc-word-generator.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('ecc')
export class EccController {
  constructor(private readonly eccService: EccService) {}

  @Post('createEccReport')
  @Public()
  @ApiOperation({
    summary: 'Create a new ECC Report',
  })
  create(@Body() createEccDto: CreateEccReportDto) {
    return this.eccService.createEccReport(createEccDto);
  }

  @Get('getAllEccReports/:createdById')
  @Public()
  @ApiOperation({
    summary: 'Retrieve all ECC Reports',
  })
  findAll(@Param('createdById') createdById: string) {
    return this.eccService.findAll(createdById);
  }

  @ApiOperation({
    summary: 'Retrieve a specific ECC Report by ID',
  })
  @Get('getEccReportById/:id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.eccService.getEccReportById(id);
  }

  //CONDITION NI NA PART

  // 1. UPDATE Condition
  @ApiOperation({
    summary: 'Update an ECC Condition by ID',
  })
  @Patch('condition/:conditionId')
  @Public()
  updateCondition(
    @Param('conditionId') conditionId: number,
    @Body() updateDto: UpdateConditionDto,
  ) {
    return this.eccService.updateCondition(conditionId, updateDto);
  }

  // 2. ADD Condition

  @ApiOperation({
    summary: 'Add a new ECC Condition to a specific ECC Report',
  })
  @Post('addCondition/:reportId')
  @Public()
  addCondition(
    @Param('reportId') reportId: string,
    @Body() createDto: CreateEccConditionDto, // Reuse the DTO, but ensure 'section' is included
  ) {
    // Note: The service will handle linking this new condition to the reportId
    return this.eccService.addCondition(reportId, createDto);
  }

  // 3. REMOVE Condition
  @ApiOperation({
    summary: 'Remove an ECC Condition by ID',
  })
  @Delete('condition/:conditionId')
  @Public()
  removeCondition(@Param('conditionId') conditionId: number) {
    return this.eccService.removeCondition(conditionId);
  }

  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ECC Report not found',
  })
  @Get('generateEccPdf/:id')
  @Public()
  @ApiOperation({
    summary: 'Generate ECC Report PDF by ID',
  })
  async generateGeneralInfoPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.eccService.generateECCreportPDF(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ecc${id}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.end(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to generate PDF',
        });
      }
    }
  }
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ECC Report not found',
  })
  @Get('generateEccWord/:id')
  @Public()
  @ApiOperation({
    summary: 'Generate ECC Report PDF by ID',
  })
  async generateWordReport(@Param('id') id: string, @Res() res: Response) {
    const { fileName, buffer } = await this.eccService.generateWordReport(id);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
  @Post('createEccAndGenerateDocs')
  @Public()
  @ApiOperation({
    summary: 'Create a new ECC Report and generate docs',
  })
  async createEccAndGenerateDocs(@Body() createEccDto: CreateEccReportDto) {
    return await this.eccService.createEccAndGenerateDocs(createEccDto);
  }

  @Post(':id/duplicate')
  @Public()
  @ApiOperation({ summary: 'Duplicate an ECC report' })
  @ApiParam({ name: 'id', description: 'ECC Report ID to duplicate' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The ECC report has been successfully duplicated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'ECC report not found.',
  })
  async duplicate(@Param('id') id: string) {
    return this.eccService.duplicate(id);
  }
}
