import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { EscrowModule } from '../escrow/escrow.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [EscrowModule, ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
