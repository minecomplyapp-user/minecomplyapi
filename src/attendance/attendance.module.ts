import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendancePdfGeneratorService } from './pdf-generator.service';
import { AttendanceDocxGeneratorService } from './docx-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendancePdfGeneratorService,
    AttendanceDocxGeneratorService,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
