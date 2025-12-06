import { IsString, IsOptional, IsEmail, IsIn, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGuestRemarkDto {
  @ApiProperty({ description: 'Report ID (CMVR or ECC)' })
  @IsString()
  @IsNotEmpty()
  reportId: string;

  @ApiProperty({ description: 'Report type', enum: ['CMVR', 'ECC'] })
  @IsIn(['CMVR', 'ECC'])
  @IsNotEmpty()
  reportType: string;

  @ApiProperty({ description: 'Guest/Member name' })
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @ApiPropertyOptional({ description: 'Guest email (optional)' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiProperty({
    description: 'Guest role',
    enum: ['Member', 'Guest', 'Stakeholder'],
  })
  @IsIn(['Member', 'Guest', 'Stakeholder'])
  @IsNotEmpty()
  guestRole: string;

  @ApiProperty({ description: 'Remarks/comments' })
  @IsString()
  @IsNotEmpty()
  remarks: string;

  @ApiPropertyOptional({ description: 'User ID if authenticated' })
  @IsString()
  @IsOptional()
  createdById?: string;
}

