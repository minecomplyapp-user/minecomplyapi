import { Module } from '@nestjs/common';
import { EccService } from './ecc.service';
import { EccController } from './ecc.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { ECCPdfGeneratorService } from './ecc-pdf-generator.service';

@Module({


    controllers: [EccController],
    providers: [EccService, ECCPdfGeneratorService],
    exports: [EccService],
})
export class EccModule {}
