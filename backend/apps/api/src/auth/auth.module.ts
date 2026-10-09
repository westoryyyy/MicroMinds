import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrivyService } from './privy.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrivyService],
  exports: [AuthService, PrivyService],
})
export class AuthModule {}
