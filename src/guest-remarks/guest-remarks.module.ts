import { Module } from '@nestjs/common';
import { SupabaseAuthModule } from '../auth/auth.module';
import { GuestRemarksController } from './guest-remarks.controller';
import { GuestRemarksService } from './guest-remarks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [SupabaseAuthModule, PrismaModule],
  controllers: [GuestRemarksController],
  providers: [GuestRemarksService],
  exports: [GuestRemarksService],
})
export class GuestRemarksModule {}

