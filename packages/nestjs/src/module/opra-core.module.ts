import * as crypto from 'crypto';
import i18next from 'i18next';
import {DynamicModule, Global, Module, Provider} from '@nestjs/common';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {initI18n} from './init-i18n';
import {OPRA_MODULE_OPTIONS, OPRA_MODULE_TOKEN} from './opra.constants';
import {OpraInterceptor} from './opra.interceptor';
import {I18n, OpraModuleAsyncOptions, OpraModuleOptions, OpraModuleOptionsFactory} from './opra.interface';

@Global()
@Module({})
export class OpraCoreModule {

  static forRoot(options: OpraModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: OPRA_MODULE_OPTIONS,
      useValue: options
    };
    const interceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useClass: OpraInterceptor
    };
    const i18nProvider: Provider = {
      provide: I18n,
      useFactory: async () => {
        await initI18n(options.i18n);
        return i18next;
      }
    };

    return {
      module: OpraCoreModule,
      providers: [optionsProvider, interceptorProvider, i18nProvider],
      exports: [i18nProvider, optionsProvider],
      global: true
    };
  }

  static forRootAsync(asyncOptions: OpraModuleAsyncOptions): DynamicModule {
    const i18nProvider: Provider = {
      provide: I18n,
      inject: [OPRA_MODULE_OPTIONS],
      useFactory: async (options: OpraModuleOptions) => {
        await initI18n(options.i18n);
        return i18next;
      }
    };
    const interceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useClass: OpraInterceptor
    };

    const asyncProviders = this.createAsyncProviders(asyncOptions);
    return {
      module: OpraCoreModule,
      imports: asyncOptions?.imports,
      providers: [
        ...asyncProviders,
        interceptorProvider,
        i18nProvider,
        {
          provide: OPRA_MODULE_TOKEN,
          useValue: crypto.randomUUID()
        }
      ],
      exports: [i18nProvider],
      global: true
    };
  }

  private static createAsyncProviders(asyncOptions: OpraModuleAsyncOptions): Provider[] {
    if (asyncOptions.useExisting || asyncOptions.useFactory)
      return [this.createAsyncOptionsProvider(asyncOptions)];

    if (asyncOptions.useClass)
      return [
        this.createAsyncOptionsProvider(asyncOptions),
        {
          provide: asyncOptions.useClass,
          useClass: asyncOptions.useClass
        }
      ];

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static createAsyncOptionsProvider(asyncOptions: OpraModuleAsyncOptions): Provider {
    if (asyncOptions.useFactory) {
      return {
        provide: OPRA_MODULE_OPTIONS,
        useFactory: asyncOptions.useFactory,
        inject: asyncOptions.inject || []
      };
    }
    const useClass = asyncOptions.useClass || asyncOptions.useExisting;
    if (useClass) {
      return {
        provide: OPRA_MODULE_OPTIONS,
        useFactory: (optionsFactory: OpraModuleOptionsFactory) =>
          optionsFactory.createOptions(),
        inject: [useClass]
      };
    }
    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

}
