import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.schema';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const env = validateEnv();
  const app = await NestFactory.create(AppModule);

  // Harden HTTP response headers & hide framework fingerprint
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  if (typeof instance?.disable === 'function') {
    instance.disable('x-powered-by');
  }

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
    next();
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  const allowedOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(',').map((o) => o.trim())
    : ['http://localhost:5173', 'http://localhost:5300'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = env.PORT;
  await app.listen(port);
  Logger.log(`🚀 CitasSistema API running on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
