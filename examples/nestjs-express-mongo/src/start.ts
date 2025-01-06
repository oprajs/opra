import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });
  await app.listen(3001);
  console.log(`Server listening  http://localhost:${3001}`);
}

bootstrap().catch(() => 0);
