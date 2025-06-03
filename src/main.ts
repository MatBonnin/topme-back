// src/main.ts

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active le parsing des cookies pour lire refresh_token
  app.use(cookieParser());

  // Active CORS en autorisant l'envoi de cookies
  app.enableCors({
    origin: true,         // ou liste de domaines autorisés
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server listening on http://localhost:${port}`);
}

bootstrap();
