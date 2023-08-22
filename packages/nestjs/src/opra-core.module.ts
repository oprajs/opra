import * as crypto from 'crypto';
import {
  DynamicModule, Global,
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider
} from '@nestjs/common';
import { HttpAdapterHost, ModulesContainer } from '@nestjs/core';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { OPRA_INITIALIZER, OPRA_MODULE_ID, OPRA_MODULE_OPTIONS } from './constants.js';
import { OpraApiFactory } from './factories/opra-api.factory.js';
import {
  OpraModuleAsyncOptions,
  OpraModuleOptions,
  OpraModuleOptionsFactory
} from './interfaces/opra-module-options.interface.js';
import { OpraModuleRef } from './opra-module-ref.js';
import { NestExplorer } from './services/nest-explorer.js';
import { OpraApiLoader } from './services/opra-api-loader.js';

@Module({
  providers: [
    OpraApiFactory,
    MetadataScanner,
    NestExplorer
  ]
})
@Global()
export class OpraCoreModule implements OnModuleInit, OnModuleDestroy {

  constructor(
      private readonly httpAdapterHost: HttpAdapterHost,
      protected readonly modulesContainer: ModulesContainer,
      @Inject(OPRA_MODULE_OPTIONS) private readonly options: OpraModuleOptions,
      @Inject(OPRA_INITIALIZER) private readonly apiLoader: OpraApiLoader,
  ) {
  }

  static forRoot(options: OpraModuleOptions & Pick<DynamicModule, 'imports' | 'providers' | 'exports'>): DynamicModule {
    const providers = [
      ...(options.providers || []),
      {
        provide: OPRA_MODULE_OPTIONS,
        useValue: options,
      },
      {
        provide: OPRA_INITIALIZER,
        useClass: OpraApiLoader
      },
      {
        provide: options.id || OpraModuleRef,
        inject: [OPRA_INITIALIZER],
        useFactory: (apiLoader: OpraApiLoader) => {
          return apiLoader.opraModuleRef;
        }
      }
    ]
    return {
      module: OpraCoreModule,
      imports: [...(options.imports || [])],
      exports: [...(options.exports || [])],
      providers
    };
  }

  static forRootAsync(asyncOptions: OpraModuleAsyncOptions): DynamicModule {
    return {
      module: OpraCoreModule,
      imports: [...(asyncOptions.imports || [])],
      providers: [
        ...(asyncOptions.providers || []),
        {
          provide: OPRA_MODULE_ID,
          useValue: crypto.randomUUID()
        },
        {
          provide: OPRA_INITIALIZER,
          useClass: OpraApiLoader
        },
        {
          provide: asyncOptions.id || OpraModuleRef,
          inject: [OPRA_INITIALIZER],
          useFactory: (apiLoader: OpraApiLoader) => {
            return apiLoader.opraModuleRef;
          }
        },
        ...this.createAsyncProviders(asyncOptions)
      ]
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

  async onModuleInit() {
    const httpAdapter = this.httpAdapterHost?.httpAdapter;
    if (!httpAdapter)
      return;
    const opraModule = (() => {
      for (const m of this.modulesContainer.values()) {
        for (const imp of m.imports.values()) {
          for (const prv of imp.providers.values())
            if (prv.instance === this) {
              return imp;
            }
        }
      }
    })();
    if (opraModule) {
      await this.apiLoader.initialize(opraModule);
    }
  }

  async onModuleDestroy() {
    await this.apiLoader.stop();
  }

}
