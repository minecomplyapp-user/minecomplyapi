import { Module } from '@nestjs/common';
import { CmvrService } from './cmvr.service';
import { CmvrController } from './cmvr.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CMVRPdfGeneratorService } from './cmvr-pdf-generator.service';
import { CMVRDocxGeneratorService } from './cmvr-docx-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [CmvrController],
  providers: [CmvrService, CMVRPdfGeneratorService, CMVRDocxGeneratorService],
  exports: [CmvrService],
})
export class CmvrModule {}
