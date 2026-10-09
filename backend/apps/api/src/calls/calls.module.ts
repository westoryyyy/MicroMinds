import { Module } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { EscrowModule } from '../escrow/escrow.module';
import { ValidationModule } from '../validation/validation.module';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [EscrowModule, ValidationModule, ListingsModule],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
