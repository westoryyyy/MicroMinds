import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrivyService } from './privy.service';

import { PrivyAuthGuard } from './privy-auth.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrivyService, PrivyAuthGuard],
  exports: [AuthService, PrivyService, PrivyAuthGuard],
})
export class AuthModule {}
