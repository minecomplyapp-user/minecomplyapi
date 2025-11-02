import { PartialType } from '@nestjs/swagger';
import { CreateAttendanceRecordDto } from './create-attendance-record.dto';

export class UpdateAttendanceRecordDto extends PartialType(
  CreateAttendanceRecordDto,
) {}
