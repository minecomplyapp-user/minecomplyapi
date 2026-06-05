import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  Res,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The attendance record has been successfully created.',
  })
  create(@Body() createAttendanceRecordDto: CreateAttendanceRecordDto) {
    return this.attendanceService.create(createAttendanceRecordDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiQuery({
    name: 'reportId',
    required: false,
    description: 'Filter by report ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all attendance records.',
  })
  findAll(@Query('reportId') reportId?: string) {
    return this.attendanceService.findAll(reportId);
  }

  @Public()
  @Get('report/:reportId')
  @ApiOperation({ summary: 'Get attendance records by report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return attendance records for the specified report.',
  })
  findByReport(@Param('reportId', ParseUUIDPipe) reportId: string) {
    return this.attendanceService.findByReport(reportId);
  }

  @Public()
  @Get('creator/:createdById')
  @ApiOperation({ summary: 'Get attendance records by creator ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return attendance records created by the specified user.',
  })
  findByCreator(@Param('createdById', ParseUUIDPipe) createdById: string) {
    return this.attendanceService
      .findAll()
      .then((records) =>
        records.filter((record) => record.createdById === createdById),
      );
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for an attendance record' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the attendance record as a PDF.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  @Header('Content-Type', 'application/pdf')
  async generatePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.attendanceService.generatePdf(id);
    const attendanceRecord = await this.attendanceService.findOne(id);

    const filename = `${attendanceRecord.fileName?.replace(/[^a-z0-9]/gi, '_') || 'attendance'}.pdf`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get(':id/docx')
  @ApiOperation({ summary: 'Generate DOCX for an attendance record' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the attendance record as a DOCX.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
  async generateDocx(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const docxBuffer = await this.attendanceService.generateDocx(id);
    const attendanceRecord = await this.attendanceService.findOne(id);

    const filename = `${attendanceRecord.fileName?.replace(/[^a-z0-9]/gi, '_') || 'attendance'}.docx`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': docxBuffer.length,
    });

    res.end(docxBuffer);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the attendance record.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The attendance record has been successfully updated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAttendanceRecordDto: UpdateAttendanceRecordDto,
  ) {
    return this.attendanceService.update(id, updateAttendanceRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The attendance record has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.remove(id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate an attendance record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The attendance record has been successfully duplicated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attendance record not found.',
  })
  duplicate(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.duplicate(id);
  }
}
