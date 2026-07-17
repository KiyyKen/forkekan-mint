import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Di belakang Nginx reverse proxy (docs/11): percayai satu hop agar
  // req.ip & rate limiting membaca X-Forwarded-For dengan benar.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // Web (SPA) dan API berada di origin berbeda saat development, dan
      // dapat tetap berbeda di production bila VITE_API_URL absolut —
      // policy default "same-origin" akan memblokir fetch() lintas origin.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);

  Logger.log(`API running at http://localhost:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
