// src/ecc/dto/update-condition.dto.ts

import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConditionDto {


    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    remark_list?: string[];

    // Add any other fields you need to update/create
}