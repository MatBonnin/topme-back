import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { readFileSync } from 'fs';

async function bootstrap() {
 
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
