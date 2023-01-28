/* eslint-disable import/extensions */
import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { HttpServiceBase, OpraHttpClient } from '@opra/client';
import { OPRA_CLIENT_MODULE_OPTIONS } from './constants';
import {
  OpraClientModuleAsyncOptions,
  OpraClientModuleOptions
} from './interfaces/module-options.interface';

@NgModule({})
export class OpraClientModule {

  public static registerClient(options: OpraClientModuleOptions): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = options.token || OpraHttpClient;
    const client = new OpraHttpClient(options.serviceUrl, options);
    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: CLIENT_TOKEN,
          useValue: client
        }
      ]
    };
  }

  public static registerService<T extends HttpServiceBase>(
      serviceClass: Type<T>,
      options: OpraClientModuleOptions
  ): ModuleWithProviders<OpraClientModule> {
    const SERVICE_TOKEN = options.token || serviceClass;
    const client = new OpraHttpClient(options.serviceUrl, options);
    const service = new serviceClass(client);
    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: SERVICE_TOKEN,
          useValue: service
        }
      ]
    };
  }

  public static registerClientAsync(
      options: OpraClientModuleAsyncOptions
  ): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = options.token || OpraHttpClient;
    const asyncProviders = this._createAsyncProviders(options);
    return {
      ngModule: OpraClientModule,
      providers: [
        ...asyncProviders,
        {
          provide: CLIENT_TOKEN,
          deps: [OPRA_CLIENT_MODULE_OPTIONS],
          useFactory: (opts: OpraClientModuleOptions) =>
              new OpraHttpClient(opts.serviceUrl, opts)
        }
      ]
    };
  }

  public static registerServiceAsync<T extends HttpServiceBase>(
      serviceClass: Type<T>,
      options: OpraClientModuleAsyncOptions
  ): ModuleWithProviders<OpraClientModule> {
    const SERVICE_TOKEN = options.token || serviceClass;
    const asyncProviders = this._createAsyncProviders(options);
    return {
      ngModule: OpraClientModule,
      providers: [
        ...asyncProviders,
        {
          provide: SERVICE_TOKEN,
          deps: [OPRA_CLIENT_MODULE_OPTIONS],
          useFactory: (opts: OpraClientModuleOptions) => {
            const client = new OpraHttpClient(opts.serviceUrl, opts)
            return new serviceClass(client);
          }
        }
      ]
    };
  }

  private static _createAsyncProviders(options: OpraClientModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this._createAsyncOptionsProvider(options)];

    if (options.useClass)
      return [
        this._createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass
        }
      ];

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static _createAsyncOptionsProvider(options: OpraClientModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: OPRA_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        deps: options.deps || [],
      };
    }
    const useClass = options.useClass || options.useExisting;
    if (useClass) {
      return {
        provide: OPRA_CLIENT_MODULE_OPTIONS,
        useFactory: (o) => o,
        deps: [useClass],
      };
    }
    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }


}
