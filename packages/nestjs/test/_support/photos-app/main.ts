import {NestFactory} from '@nestjs/core';
import {ApplicationModule} from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(ApplicationModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug']
  });
  app.setGlobalPrefix('/api/v1');
  await app.listen(3001);
}

bootstrap().catch(() => 0);
