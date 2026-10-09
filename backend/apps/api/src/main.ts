import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global uniform error format: { error: { code, message } }
  app.useGlobalFilters(new AllExceptionsFilter());

  // Cors for local development
  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(`MicroMinds API running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap().catch((err: unknown) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
