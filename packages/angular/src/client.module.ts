/* eslint-disable import/extensions */
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { HttpServiceBase } from '@opra/client';
import { OpraAngularClient } from './angular-client';
import { OPRA_CLIENT_MODULE_OPTIONS } from './constants';
import {
  OpraClientModuleAsyncOptions,
  OpraClientModuleOptions
} from './interfaces/module-options.interface';

@NgModule({})
export class OpraClientModule {

  public static registerClient(options: OpraClientModuleOptions): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = options.token || OpraAngularClient;
    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: CLIENT_TOKEN,
          deps: [HttpClient],
          useFactory: (httpClient: HttpClient) =>
              new OpraAngularClient(httpClient, options.serviceUrl, options)
        }
      ]
    };
  }

  public static registerService<T extends HttpServiceBase>(
      serviceClass: Type<T>,
      options: OpraClientModuleOptions
  ): ModuleWithProviders<OpraClientModule> {
    const SERVICE_TOKEN = options.token || serviceClass;
    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: SERVICE_TOKEN,
          deps: [HttpClient],
          useFactory: (httpClient: HttpClient) => {
            const opraAngularClient = new OpraAngularClient(httpClient, options.serviceUrl, options);
            return new serviceClass(opraAngularClient);
          }
        }
      ]
    };
  }

  public static registerClientAsync(
      options: OpraClientModuleAsyncOptions
  ): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = options.token || OpraAngularClient;
    const asyncProviders = this._createAsyncProviders(options);
    return {
      ngModule: OpraClientModule,
      providers: [
        ...asyncProviders,
        {
          provide: CLIENT_TOKEN,
          deps: [HttpClient, OPRA_CLIENT_MODULE_OPTIONS],
          useFactory: (httpClient: HttpClient, opts: OpraClientModuleOptions) =>
              new OpraAngularClient(httpClient, opts.serviceUrl, opts)
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
          deps: [HttpClient, OPRA_CLIENT_MODULE_OPTIONS],
          useFactory: (httpClient: HttpClient, opts: OpraClientModuleOptions) => {
            const opraAngularClient = new OpraAngularClient(httpClient, opts.serviceUrl, opts);
            return new serviceClass(opraAngularClient);
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
