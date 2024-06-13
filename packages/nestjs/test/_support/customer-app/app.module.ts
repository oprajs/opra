import { Module, UseGuards } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import {
  Address,
  Country,
  Customer,
  GenderEnum,
  Note,
  Person,
  Profile,
  Record,
} from '../../../../common/test/_support/test-api/index.js';
import {
  AuthController,
  CustomerController,
  CustomersController,
  FilesController,
  MyProfileController,
  RootController,
} from '../../../../core/test/_support/test-api/index.js';
import { OpraHttpModule } from '../../../src/index.js';
import { AuthGuard } from './guards/auth.guard.js';
import { TestGlobalGuard } from './guards/global.guard.js';
import { LogCounterInterceptor } from './guards/log-counter.interceptor.js';

/** Inject AuthGuard into MyProfileController */
UseGuards(AuthGuard)(MyProfileController);

@Module({
  imports: [
    OpraHttpModule.forRoot({
      name: 'CustomerApi',
      basePath: 'svc1',
      controllers: [
        RootController,
        AuthController,
        CustomersController,
        CustomerController,
        FilesController,
        MyProfileController,
      ],
      types: [Address, Note, Person, Record, GenderEnum, Country, Customer, Profile],
    }),
  ],
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
export class ApplicationModule {}
