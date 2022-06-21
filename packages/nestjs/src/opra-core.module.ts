import * as crypto from 'crypto';
import {DynamicModule, Inject, Module, OnModuleDestroy, OnModuleInit, Provider} from '@nestjs/common';
import {HttpAdapterHost, ModulesContainer} from '@nestjs/core';
import {MetadataScanner} from '@nestjs/core/metadata-scanner';
import {I18n, InitOptions} from '@opra/i18n';
import {ServiceFactory} from './factories/service.factory.js';
import {
  OpraModuleAsyncOptions,
  OpraModuleOptions,
  OpraModuleOptionsFactory
} from './interfaces/opra-module-options.interface.js';
import {OPRA_INITIALIZER, OPRA_MODULE_ID, OPRA_MODULE_OPTIONS} from './opra.constants.js';
import {ExplorerService} from './services/explorer.service.js';
import {OpraServiceLoader} from './services/service-loader.js';
import {ModuleThunk} from './types';

@Module({
  providers: [
    ServiceFactory,
    MetadataScanner,
    ExplorerService
  ]
})
export class OpraCoreModule implements OnModuleInit, OnModuleDestroy {

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    protected readonly modulesContainer: ModulesContainer,
    @Inject(OPRA_MODULE_OPTIONS) private readonly options: OpraModuleOptions,
    @Inject(OPRA_INITIALIZER) private readonly opraDriver: OpraServiceLoader,
  ) {
  }

  static forRoot(serviceModule: ModuleThunk, options: OpraModuleOptions): DynamicModule {
    return {
      module: OpraCoreModule,
      imports: [serviceModule],
      providers: [
        {
          provide: OPRA_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: OPRA_INITIALIZER,
          useClass: OpraServiceLoader
        },
        this.createI18nProvider()
      ]
    };
  }

  static forRootAsync(serviceModule: ModuleThunk, asyncOptions: OpraModuleAsyncOptions): DynamicModule {
    return {
      module: OpraCoreModule,
      imports: [serviceModule, ...(asyncOptions?.imports || [])],
      providers: [
        {
          provide: OPRA_MODULE_ID,
          useValue: crypto.randomUUID()
        },
        {
          provide: OPRA_INITIALIZER,
          useClass: OpraServiceLoader
        },
        ...this.createAsyncProviders(asyncOptions),
        this.createI18nProvider(),
      ]
    };
  }

  private static createI18nProvider(): Provider {
    return {
      provide: I18n,
      inject: [OPRA_MODULE_OPTIONS],
      useFactory: async (options: OpraModuleOptions) => {
        const opts = options.i18n;
        const initOptions: InitOptions = {
          lng: opts?.lng,
          fallbackLng: opts?.fallbackLng,
          defaultNS: opts?.defaultNS,
          resources: opts?.resources,
          resourceDirs: opts?.resourceDirs
        }
        const instance = I18n.createInstance();
        await instance.init(initOptions);
        return instance;
      }
    }
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
      await this.opraDriver.initialize(opraModule);
    }
  }

  async onModuleDestroy() {
    await this.opraDriver.stop();
  }

}
