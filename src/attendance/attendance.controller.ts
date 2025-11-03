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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './dto';

@ApiTags('attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The attendance record has been successfully created.',
  })
  create(@Body() createAttendanceRecordDto: CreateAttendanceRecordDto) {
    return this.attendanceService.create(createAttendanceRecordDto);
  }

  @Post('upload-signature')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a signature image to Supabase storage' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Signature image file (PNG, JPG, JPEG, WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signature uploaded successfully. Returns the storage path.',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', example: 'signatures/uuid-signature.png' },
        url: {
          type: 'string',
          example: 'https://...supabase.co/storage/v1/...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No file uploaded or invalid file type.',
  })
  async uploadSignature(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG, JPG, JPEG, and WebP are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    return this.attendanceService.uploadSignature(file);
  }

  @Post('upload-attachment')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment image to Supabase storage' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Attachment image file (PNG, JPG, JPEG, WebP)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attachment uploaded successfully. Returns the storage path.',
    schema: {
      type: 'object',
      properties: {
        path: { type: 'string', example: 'uploads/uuid-photo.jpg' },
        url: {
          type: 'string',
          example: 'https://...supabase.co/storage/v1/...',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No file uploaded or invalid file type.',
  })
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PNG, JPG, JPEG, and WebP are allowed.',
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    return this.attendanceService.uploadAttachment(file);
  }

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

  @Get('report/:reportId')
  @ApiOperation({ summary: 'Get attendance records by report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return attendance records for the specified report.',
  })
  findByReport(@Param('reportId', ParseUUIDPipe) reportId: string) {
    return this.attendanceService.findByReport(reportId);
  }

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
  @ApiQuery({
    name: 'token',
    required: false,
    description:
      'JWT token for authentication (alternative to Authorization header)',
  })
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
    @Query('token') token: string | undefined,
    @Res() res: Response,
  ) {
    // Note: Token from query param is handled by auth guard/middleware if needed
    // For now, the endpoint relies on existing JWT auth from headers
    const pdfBuffer = await this.attendanceService.generatePdf(id);
    const attendanceRecord = await this.attendanceService.findOne(id);

    const filename = `${attendanceRecord.title?.replace(/[^a-z0-9]/gi, '_') || id}_${new Date().toISOString().split('T')[0]}.pdf`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get(':id/docx')
  @ApiOperation({ summary: 'Generate DOCX for an attendance record' })
  @ApiQuery({
    name: 'token',
    required: false,
    description:
      'JWT token for authentication (alternative to Authorization header)',
  })
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
    @Query('token') token: string | undefined,
    @Res() res: Response,
  ) {
    const docxBuffer = await this.attendanceService.generateDocx(id);
    const attendanceRecord = await this.attendanceService.findOne(id);

    const filename = `${attendanceRecord.title?.replace(/[^a-z0-9]/gi, '_') || id}_${new Date().toISOString().split('T')[0]}.docx`;

    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': docxBuffer.length,
    });

    res.end(docxBuffer);
  }
}
