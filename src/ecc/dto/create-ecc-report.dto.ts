import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsDate,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject, // Use IsObject for general JSON fields
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEccConditionDto as EccConditionDto } from './create-ecc-condition.dto';

export class CreateEccReportDto {
  // Columns matching the image: permit_holder (text)
  @ApiPropertyOptional({
    description: 'List of remarks/observations related to the condition',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permit_holders?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EccConditionDto)
  conditions?: EccConditionDto[];

  @ApiProperty({ description: 'ID of the user who created the report' })
  @IsString()
  createdById: string;

  @ApiProperty({ description: 'General information about the report' })
  @IsObject()
  generalInfo: object;

  
  @IsObject()
  mmtInfo: object;

  @ApiProperty({
    description: 'Details about the Multi-Partite Monitoring Team',
  })
  
  @IsObject()
  remarks_list?: object;



  @IsObject()
  permit_holder_with_conditions?: object;


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];


  @ApiProperty({ description: 'ID of the user who created the report' })
  @IsString()
  filename: string;
}
