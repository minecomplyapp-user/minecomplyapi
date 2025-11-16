import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DuplicateRecordOptionsDto {
  @ApiPropertyOptional({
    description:
      'Override the creator user ID recorded on the duplicated entry',
  })
  @IsOptional()
  @IsString()
  createdById?: string;

  @ApiPropertyOptional({
    description: 'Custom file name to persist on the duplicated entry',
  })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({
    description: 'When applicable, copy attachments from the source entry',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  copyAttachments?: boolean;
}
