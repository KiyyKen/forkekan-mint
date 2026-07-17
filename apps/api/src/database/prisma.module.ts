import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Module global agar PrismaService tersedia di seluruh feature module
 * tanpa perlu import berulang.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
