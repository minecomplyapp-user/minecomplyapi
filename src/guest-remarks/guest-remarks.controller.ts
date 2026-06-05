import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GuestRemarksService } from './guest-remarks.service';
import { CreateGuestRemarkDto } from './dto/create-guest-remark.dto';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Guest Remarks')
@Controller('guest-remarks')
export class GuestRemarksController {
  constructor(private readonly guestRemarksService: GuestRemarksService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a guest remark' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Guest remark submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(@Body() createDto: CreateGuestRemarkDto) {
    return this.guestRemarksService.create(createDto);
  }

  @Get('report/:reportId')
  @Public()
  @ApiOperation({ summary: 'Get all remarks for a specific report' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of remarks for the report',
  })
  async findByReport(@Param('reportId') reportId: string) {
    return this.guestRemarksService.findByReport(reportId);
  }

  @Get('report/:reportId/count')
  @Public()
  @ApiOperation({ summary: 'Get remarks count for a report' })
  @ApiParam({ name: 'reportId', description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Number of remarks for the report',
  })
  async getReportCount(@Param('reportId') reportId: string) {
    const count = await this.guestRemarksService.getReportRemarksCount(
      reportId,
    );
    return { reportId, count };
  }

  @Get('user/:userId')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all remarks submitted by a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of remarks by the user',
  })
  async findByUser(@Param('userId') userId: string) {
    return this.guestRemarksService.findByUser(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single remark by ID' })
  @ApiParam({ name: 'id', description: 'Remark ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest remark details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Remark not found',
  })
  async findOne(@Param('id') id: string) {
    return this.guestRemarksService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a guest remark (admin only)' })
  @ApiParam({ name: 'id', description: 'Remark ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Remark deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Remark not found',
  })
  async remove(@Param('id') id: string) {
    return this.guestRemarksService.remove(id);
  }
}

