import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cron from 'node-cron';
import fetch from 'node-fetch';


(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const globalPrefix = configService.get<string>('app.globalPrefix');
  const port = Number(
    configService.get<string | number>('app.port', { infer: true }) ?? 3000,
  );
  const corsOrigins =
    configService.get<string[]>('app.corsOrigins', { infer: true }) ?? [];

  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : true,
    credentials: true,
  });

  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  // --- Swagger (OpenAPI) setup ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MineComply API')
    .setDescription('API documentation for MineComply backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(
    `${globalPrefix ? '/' + globalPrefix : ''}/docs`,
    app,
    document,
  );
  // --- End Swagger setup ---

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port, '0.0.0.0');
}

  const appUrl =`https://minecomplyapi.onrender.com/api`;

 console.log(`Keep-alive pings enabled for: ${appUrl}`);

cron.schedule('*/10 * * * *', async () => {
  try {
    const res = await fetch(`${appUrl}/health`);
    console.log(`🔁 Keep-alive ping: ${res.status}`);
  } catch (err) {
    console.error('❌ Keep-alive ping failed:', err.message);
  }
});

void bootstrap();
