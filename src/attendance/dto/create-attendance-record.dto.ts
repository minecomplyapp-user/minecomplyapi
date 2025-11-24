import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AttendanceStatus {
  IN_PERSON = 'IN_PERSON',
  ONLINE = 'ONLINE',
  ABSENT = 'ABSENT',
}

export class AttendeeDto {
  @ApiProperty({ description: 'Name of the attendee' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Agency of the attendee' })
  @IsOptional()
  @IsString()
  agency?: string;

  @ApiPropertyOptional({ description: 'Office of the attendee' })
  @IsOptional()
  @IsString()
  office?: string;

  @ApiPropertyOptional({ description: 'Position of the attendee' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: 'URL to the signature image/drawing' })
  @IsOptional()
  @IsString()
  signatureUrl?: string;

  @ApiPropertyOptional({ description: 'URL to the attendance photo' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({
    description: 'Attendance status of the attendee',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  @IsEnum(AttendanceStatus)
  attendanceStatus: AttendanceStatus;
}

export class CreateAttendanceRecordDto {
  @ApiPropertyOptional({ description: 'ID of the associated report' })
  @IsOptional()
  @IsString()
  reportId?: string;

  @ApiPropertyOptional({
    description: 'ID of the user who created this attendance record',
  })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiProperty({ description: 'File name of the attendance record' })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({ description: 'Title of the meeting/event' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the meeting/event' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Date and time of the meeting' })
  @IsOptional()
  @IsDateString()
  meetingDate?: string;

  @ApiPropertyOptional({ description: 'Location of the meeting' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'List of attendees',
    type: [AttendeeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendeeDto)
  attendees: AttendeeDto[];
}
