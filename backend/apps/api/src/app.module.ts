import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { ListingsModule } from './listings/listings.module';
import { AuthModule } from './auth/auth.module';
import { CallsModule } from './calls/calls.module';
import { EscrowModule } from './escrow/escrow.module';
import { ValidationModule } from './validation/validation.module';
import { ApiKeyMiddleware } from './auth/api-key.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ListingsModule,
    EscrowModule,
    ValidationModule,
    CallsModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply API key auth to protected routes
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        // Public routes — no API key needed
        { path: 'listings', method: RequestMethod.GET },
        { path: 'listings/(.*)', method: RequestMethod.GET },
        { path: 'api-keys', method: RequestMethod.POST },
        { path: 'health', method: RequestMethod.GET },
        // Escrow debug endpoints (balance requires key in prod, but open for testing)
        { path: 'escrow/balance/(.*)', method: RequestMethod.GET },
        { path: 'escrow/mock-deposit', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
