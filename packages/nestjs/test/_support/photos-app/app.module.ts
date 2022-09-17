import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { OpraModule } from '../../../src/index.js';
import config from './config.js';
import { TestGlobalGuard } from './guards/global.guard.js';
import { Service1RootModule } from './service-root.module.js';

@Module({
  imports: [
    OpraModule.forRoot({
      ...config,
      prefix: 'svc1',
      imports: [Service1RootModule]
    }),
  ],
  providers: [{
    provide: APP_GUARD,
    useExisting: TestGlobalGuard
  }, TestGlobalGuard]
})
export class ApplicationModule {
}
