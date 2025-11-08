import { Module } from '@nestjs/common';
import { CmvrService } from './cmvr.service';
import { CmvrController } from './cmvr.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CMVRPdfGeneratorService } from './cmvr-pdf-generator.service';
import { CMVRDocxGeneratorService } from './cmvr-docx-generator.service';
import { AttendanceModule } from '../attendance/attendance.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, AttendanceModule, StorageModule],
  controllers: [CmvrController],
  providers: [CmvrService, CMVRPdfGeneratorService, CMVRDocxGeneratorService],
  exports: [CmvrService],
})
export class CmvrModule {}
