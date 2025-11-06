// dto/ecc-condition.dto.ts

import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
export class CreateEccConditionDto {
  @ApiPropertyOptional({ description: 'The specific condition text' })
  @IsOptional()
  @IsString()
  condition?: string;

  @ApiPropertyOptional({
    description:
      'The current status of the condition (e.g., Compliant, Non-Compliant)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Remarks or detailed notes about the condition',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'List of remarks/observations related to the condition',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Ensures every element in the array is a string
  remark_list?: string[];

  // ECCReportID is typically set by the backend via the relation, so we omit it here.
  @ApiPropertyOptional({
    description: 'ID of the parent condition this entry is nested under',
  })
  @IsOptional()
  // @IsUUID() // <-- Use IsUUID for stricter ID format checking
  nested_to?: number;

  @ApiPropertyOptional({ description: 'The number identifying the condition' })
  @IsInt()
  condition_number?: number;

  @ApiPropertyOptional({ description: 'The number identifying the condition' })
  @IsInt()
  section?: number;
}
