import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { ListingsModule } from '../listings/listings.module';
import { EscrowModule } from '../escrow/escrow.module';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [ListingsModule, EscrowModule, ValidationModule],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
