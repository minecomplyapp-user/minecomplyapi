import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfGeneratorService } from './pdf-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, PdfGeneratorService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
