import { Module } from '@nestjs/common';
import { OpraModule } from '../../../src/index.js';
import config from './config.js';
import { Service1RootModule } from './service-root.module.js';

@Module({
  imports: [
    OpraModule.forRoot({
      ...config,
      prefix: 'svc1',
      imports: [Service1RootModule]
    }),
  ],
})
export class ApplicationModule {
}
