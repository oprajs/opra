/* eslint-disable import/extensions */
import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { OpraHttpClient } from '@opra/client';
import { OPRA_CLIENT_MODULE_OPTIONS } from './constants';
import { OpraClientModuleAsyncOptions, OpraClientModuleOptions } from './interfaces/module-options.interface';

@NgModule({})
export class OpraClientModule {

  public static forRoot(options: OpraClientModuleOptions): ModuleWithProviders<OpraClientModule> {
    const serviceClass = options.serviceClass;
    const CLIENT_TOKEN = options.clientToken || OpraHttpClient;
    const SERVICE_TOKEN = options.serviceToken || serviceClass;
    const client = new OpraHttpClient(options.serviceUrl, options);
    const serviceProviders: any = [];
    if (serviceClass)
      serviceProviders.push({
        provide: SERVICE_TOKEN,
        deps: [CLIENT_TOKEN],
        useFactory: (opraHttpClient: OpraHttpClient) => {
          return new serviceClass(opraHttpClient);
        }
      });
    return {
      ngModule: OpraClientModule,
      providers: [
        ...serviceProviders,
        {
          provide: OPRA_CLIENT_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: CLIENT_TOKEN,
          useValue: client
        },
        {
          provide: APP_INITIALIZER,
          useFactory: () => {
            return () => client.init()
          },
          multi: true
        },
      ]
    };
  }

  public static forRootAsync(
      options: OpraClientModuleAsyncOptions
  ): ModuleWithProviders<OpraClientModule> {
    const serviceClass = options.serviceClass;
    const CLIENT_TOKEN = options.clientToken || OpraHttpClient;
    const SERVICE_TOKEN = options.serviceToken || serviceClass;
    const asyncProviders = this.createAsyncProviders(options);
    const serviceProviders: any = [];
    if (serviceClass)
      serviceProviders.push({
        provide: SERVICE_TOKEN,
        deps: [CLIENT_TOKEN],
        useFactory: (opraHttpClient: OpraHttpClient) => {
          return new serviceClass(opraHttpClient);
        }
      });

    return {
      ngModule: OpraClientModule,
      providers: [
        ...asyncProviders,
        ...serviceProviders,
        {
          provide: CLIENT_TOKEN,
          deps: [OPRA_CLIENT_MODULE_OPTIONS],
          useFactory: (opts: OpraClientModuleOptions) =>
              new OpraHttpClient(opts.serviceUrl, opts)
        },
        {
          provide: APP_INITIALIZER,
          deps: [CLIENT_TOKEN],
          useFactory: (client: OpraHttpClient) => {
            return () => client.init()
          },
          multi: true
        }
      ]
    };
  }

  private static createAsyncProviders(options: OpraClientModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory)
      return [this.createAsyncOptionsProvider(options)];

    if (options.useClass)
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass
        }
      ];

    throw new Error('Invalid configuration. Must provide useFactory, useClass or useExisting');
  }

  private static createAsyncOptionsProvider(options: OpraClientModuleAsyncOptions): Provider {
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
