import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Configures the NestJS app with the same global pipes used in production
 * This ensures e2e tests run with the same validation as production
 */
export function setupTestApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );
}
