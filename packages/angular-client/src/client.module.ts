import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { OpraClient } from '@opra/client';
import { OPRA_CLIENT_MODULE_OPTIONS } from './constants.js';
import { createClientOptions, getClientToken } from './imp/utils.js';
import { OpraClientModuleAsyncOptions, OpraClientModuleOptions } from './module-options.interface.js';

@NgModule({
  imports: [HttpClientModule],
})
export class OpraClientModule {

  public static forRoot(
      options: OpraClientModuleOptions
  ): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = getClientToken(options.name);

    return {
      ngModule: OpraClientModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          deps: [CLIENT_TOKEN],
          useFactory: (client: OpraClient) => {
            return () => client.init()
          },
          multi: true
        },
        {
          provide: OPRA_CLIENT_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: CLIENT_TOKEN,
          deps: [HttpClient],
          useFactory: (httpClient: HttpClient) =>
              new OpraClient(options.serviceUrl, createClientOptions(httpClient, options))
        }
      ]
    };
  }

  public static forRootAsync(
      options: OpraClientModuleAsyncOptions
  ): ModuleWithProviders<OpraClientModule> {
    const CLIENT_TOKEN = getClientToken(options.name);
    const asyncProviders = this.createAsyncProviders(options);

    return {
      ngModule: OpraClientModule,
      providers: [
        ...asyncProviders,
        {
          provide: APP_INITIALIZER,
          deps: [CLIENT_TOKEN],
          useFactory: (client: OpraClient) => {
            return () => client.init()
          },
          multi: true
        },
        {
          provide: CLIENT_TOKEN,
          deps: [HttpClient, OPRA_CLIENT_MODULE_OPTIONS],
          useFactory: (httpClient: HttpClient, opts: OpraClientModuleOptions) =>
              new OpraClient(opts.serviceUrl, createClientOptions(httpClient, opts))
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
