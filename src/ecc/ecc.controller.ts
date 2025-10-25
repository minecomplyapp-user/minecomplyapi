import { EccService } from './ecc.service';
import { CreateEccReportDto } from './dto/create-ecc-report.dto';
import {
  Controller,
  Get,
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

@Controller('ecc')
export class EccController {
  constructor(private readonly eccService: EccService) {}

@Post('createEccReport')
create(@Body() createEccDto: CreateEccReportDto) {
  return this.eccService.createEccReport(createEccDto);
}
  @Get('getAllEccReports')
  findAll() {
    return this.eccService.findAll();
  }

  @Get('getEccReportById/:id')
  findOne(@Param('id') id: string) {
    return this.eccService.findOne(id);
  }
  

  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'CMVR Report not found or no generalInfo data',
  })
  @Get('generateEccPdf/:id') // 👈 Add this line
  async generateGeneralInfoPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.eccService.generateECCreportPDF(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cmvr-general-info-${id}.pdf"`,
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
}


