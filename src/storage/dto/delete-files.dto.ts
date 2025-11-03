import { IsArray, IsString } from 'class-validator';

export class DeleteFilesDto {
  @IsArray()
  @IsString({ each: true })
  paths: string[];
}
