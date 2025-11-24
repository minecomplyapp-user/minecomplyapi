import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendancePdfGeneratorService } from './pdf-generator.service';
import { AttendanceDocxGeneratorService } from './docx-generator.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendancePdfGeneratorService,
    AttendanceDocxGeneratorService,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
