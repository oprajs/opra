import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { ApplicationModule } from 'nestjs-express-mongo';
import { TestGlobalGuard } from './guards/global.guard.js';
import { LogCounterInterceptor } from './guards/log-counter.interceptor.js';

@Module({
  imports: [ApplicationModule],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: TestGlobalGuard,
    },
    TestGlobalGuard,
    {
      provide: APP_INTERCEPTOR,
      useExisting: LogCounterInterceptor,
    },
    LogCounterInterceptor,
  ],
})
export class TestModule {}
