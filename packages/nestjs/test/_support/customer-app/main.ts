import { NestFactory } from '@nestjs/core';
import { TestModule } from './test.module.js';

async function bootstrap() {
  const app = await NestFactory.create(TestModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });
  app.setGlobalPrefix('/api/v1');
  await app.listen(3001);
}

bootstrap().catch(() => 0);
