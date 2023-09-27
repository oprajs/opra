import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { OpraModule } from '../../../src/index.js';
import { ApiRootModule } from './api/api.module.js';
import config from './config.js';
import { TestGlobalGuard } from './guards/global.guard.js';
import { LogCounterInterceptor } from './guards/log-counter.interceptor.js';

@Module({
  imports: [
    OpraModule.forRoot({
      ...config,
      basePath: 'svc1',
      imports: [ApiRootModule]
    }),
  ],
  providers: [{
    provide: APP_GUARD,
    useExisting: TestGlobalGuard
  }, TestGlobalGuard,
    {
      provide: APP_INTERCEPTOR,
      useExisting: LogCounterInterceptor
    }, LogCounterInterceptor]
})
export class ApplicationModule {
}
