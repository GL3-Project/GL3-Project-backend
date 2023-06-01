import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MiscConfig } from '@config';
import { AppInterceptor } from '@app.interceptor';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // increase the limit for streaming files
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  // standardize response
  app.useGlobalInterceptors(new AppInterceptor());

  // enable logging
  app.useLogger(['log', 'error', 'warn']);

  // configure CORS policy to accept requests only from frontend server
  const { front, dashboard } = configService.getOrThrow<MiscConfig>('misc');
  const allowedOrigins = [front, dashboard].filter(
    (origin) => origin !== undefined,
  ) as string[];
  app.enableCors({ origin: allowedOrigins });

  // get port to listen on from environment variables
  const PORT = configService.getOrThrow<MiscConfig>('misc').port;
  await app.listen(PORT);
}

bootstrap();
