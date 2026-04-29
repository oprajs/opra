import { HttpClient } from '@angular/common/http';
import {
  type ModuleWithProviders,
  NgModule,
  type Provider,
  Type,
} from '@angular/core';
import { kClient } from '@opra/client';
import { OpraAngularClient } from './angular-client.js';
import { OPRA_CLIENT_MODULE_OPTIONS } from './constants.js';
import type {
  OpraClientModuleAsyncOptions,
  OpraClientModuleOptions,
} from './interfaces/module-options.interface.js';

/**
 * Angular module for OPRA client.
 */
@NgModule({})
export class OpraClientModule {
  /**
   * Registers a client provider.
   *
   * @param options Configuration options for the client.
   * @returns A ModuleWithProviders instance.
   */
  public static registerClient(
    options: OpraClientModuleOptions,
  ): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = options.token || OpraAngularClient;
    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: CLIENT_TOKEN,
          deps: [HttpClient],
          useFactory: (httpClient: HttpClient) =>
            new OpraAngularClient(httpClient, options.serviceUrl, options),
        },
      ],
    };
  }

  /**
   * Registers a service provider.
   *
   * @param serviceClass The service class to register.
   * @param options Configuration options for the service.
   * @returns A ModuleWithProviders instance.
   */
  public static registerService<T>(
    serviceClass: Type<T>,
    options: OpraClientModuleOptions,
  ): ModuleWithProviders<OpraClientModule> {
    const SERVICE_TOKEN = options.token || serviceClass;
    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: SERVICE_TOKEN,
          deps: [HttpClient],
          useFactory: (httpClient: HttpClient) => {
            const opraAngularClient = new OpraAngularClient(
              httpClient,
              options.serviceUrl,
              options,
            );
            const service = new serviceClass(opraAngularClient);
            service[kClient] = opraAngularClient;
            return service;
          },
        },
      ],
    };
  }

  /**
   * Registers a client provider asynchronously.
   *
   * @param options Asynchronous configuration options for the client.
   * @returns A ModuleWithProviders instance.
   */
  public static registerClientAsync(
    options: OpraClientModuleAsyncOptions,
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
            new OpraAngularClient(httpClient, opts.serviceUrl, opts),
        },
      ],
    };
  }

  /**
   * Registers a service provider asynchronously.
   *
   * @param serviceClass The service class to register.
   * @param options Asynchronous configuration options for the service.
   * @returns A ModuleWithProviders instance.
   */
  public static registerServiceAsync<T>(
    serviceClass: Type<T>,
    options: OpraClientModuleAsyncOptions,
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
          useFactory: (
            httpClient: HttpClient,
            opts: OpraClientModuleOptions,
          ) => {
            const opraAngularClient = new OpraAngularClient(
              httpClient,
              opts.serviceUrl,
              opts,
            );
            const service = new serviceClass(opraAngularClient);
            service[kClient] = opraAngularClient;
            return service;
          },
        },
      ],
    };
  }

  private static _createAsyncProviders(
    options: OpraClientModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this._createAsyncOptionsProvider(options)];

    if (options.useClass) {
      return [
        this._createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    throw new Error(
      'Invalid configuration. Must provide useFactory, useClass or useExisting',
    );
  }

  private static _createAsyncOptionsProvider(
    options: OpraClientModuleAsyncOptions,
  ): Provider {
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
        useFactory: o => o,
        deps: [useClass],
      };
    }
    throw new Error(
      'Invalid configuration. Must provide useFactory, useClass or useExisting',
    );
  }
}
