import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject, // Use IsObject for general JSON fields
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateEccConditionDto as EccConditionDto } from './create-ecc-condition.dto';


export class CreateEccReportDto {


  // Columns matching the image: createdById (text)

  // Columns matching the image: permit_holder (text)
  @ApiProperty({ description: 'Name of the permit holder/proponent' })
  @IsString()
  permitHolder: string; 



 @IsArray() // 👈 CORRECT: The field must be an array
 @ValidateNested({ each: true }) // 👈 CORRECT: Validate every object in the array
 @Type(() => EccConditionDto) // 👈 CORRECT: Transform raw JSON objects into DTO instances
 conditions?: EccConditionDto[]
  // createdAt and updatedAt are typically handled by the database (like CURRENT_TIMESTAMP) 
  // and are usually omitted from the Create DTO.
}