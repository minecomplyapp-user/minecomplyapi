import { Module } from '@nestjs/common';
import { CmvrService } from './cmvr.service';
import { CmvrController } from './cmvr.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CMVRPdfGeneratorService } from './cmvr-pdf-generator.service';

@Module({
  imports: [PrismaModule],
  controllers: [CmvrController],
  providers: [CmvrService, CMVRPdfGeneratorService],
  exports: [CmvrService],
})
export class CmvrModule {}
