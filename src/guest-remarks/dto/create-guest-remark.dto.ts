import { IsString, IsOptional, IsEmail, IsIn, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGuestRemarkDto {
  // Legacy fields (optional for backward compatibility)
  @ApiPropertyOptional({ description: 'Report ID (CMVR or ECC)' })
  @IsString()
  @IsOptional()
  reportId?: string;

  @ApiPropertyOptional({ description: 'Report type', enum: ['CMVR', 'ECC'] })
  @IsIn(['CMVR', 'ECC'])
  @IsOptional()
  reportType?: string;

  @ApiPropertyOptional({ description: 'Guest/Member name (legacy - use fullName instead)' })
  @IsString()
  @IsOptional()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Guest email (optional)' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional({
    description: 'Guest role (legacy)',
    enum: ['Member', 'Guest', 'Stakeholder'],
  })
  @IsIn(['Member', 'Guest', 'Stakeholder'])
  @IsOptional()
  guestRole?: string;

  @ApiPropertyOptional({ description: 'Remarks/comments (legacy - use recommendations instead)' })
  @IsString()
  @IsOptional()
  remarks?: string;

  // ✅ NEW: Google Form fields (MMT Observation Form)
  @ApiProperty({ description: 'Full Name (required for new submissions, optional for backward compatibility)' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ 
    description: 'Agency/Organization Represented (MGB, EMB, LGU, CENRO, PENRO, NGO, COMPANY, Other)',
    enum: ['MGB', 'EMB', 'LGU', 'CENRO', 'PENRO', 'NGO', 'COMPANY', 'Other']
  })
  @IsString()
  @IsOptional()
  agency?: string;

  @ApiPropertyOptional({ description: 'Specify agency if "Other" is selected' })
  @IsString()
  @IsOptional()
  agencyOther?: string;

  @ApiPropertyOptional({ description: 'Position/Designation' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ description: 'Date of Monitoring (YYYY-MM-DD format)' })
  @IsDateString()
  @IsOptional()
  dateOfMonitoring?: string;

  @ApiPropertyOptional({ description: 'Site / Company Monitored' })
  @IsString()
  @IsOptional()
  siteCompanyMonitored?: string;

  @ApiPropertyOptional({ description: 'Observations (optional)' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ description: 'Issues or Concerns Noted (optional)' })
  @IsString()
  @IsOptional()
  issuesConcerns?: string;

  @ApiProperty({ description: 'Recommendations (required for new submissions, optional for backward compatibility)' })
  @IsString()
  @IsOptional()
  recommendations?: string;

  // Metadata
  @ApiPropertyOptional({ description: 'User ID if authenticated' })
  @IsString()
  @IsOptional()
  createdById?: string;

  @ApiPropertyOptional({ description: 'User email for reference' })
  @IsEmail()
  @IsOptional()
  createdByEmail?: string;
}

