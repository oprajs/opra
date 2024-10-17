import {
  type DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { isConstructor } from '@opra/common';
import { KafkaAdapter, type KafkaContext } from '@opra/kafka';
import { OPRA_KAFKA_MODULE_CONFIG } from '../constants.js';
import { initializeAdapter } from './helpers/initialize-adapter.js';
import type { OpraKafkaModule } from './opra-kafka.module.js';

const opraKafkaNestjsAdapterToken = Symbol('OpraKafkaNestjsAdapter');

@Module({})
@Global()
export class OpraKafkaCoreModule implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    protected moduleRef: ModuleRef,
    @Inject(opraKafkaNestjsAdapterToken)
    protected adapter: KafkaAdapter,
    @Inject(OPRA_KAFKA_MODULE_CONFIG)
    protected config: OpraKafkaModule.ApiConfig,
  ) {}

  static forRoot(moduleOptions: OpraKafkaModule.ModuleOptions): DynamicModule {
    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_KAFKA_MODULE_CONFIG,
          useValue: {
            ...moduleOptions,
            logger: moduleOptions.logger || new Logger(moduleOptions.name),
          },
        },
      ],
    });
  }

  static forRootAsync(moduleOptions: OpraKafkaModule.AsyncModuleOptions): DynamicModule {
    if (!moduleOptions.useFactory) throw new Error('Invalid configuration. Must provide "useFactory"');

    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_KAFKA_MODULE_CONFIG,
          inject: moduleOptions.inject,
          useFactory: async (...args: any[]) => {
            const result = await moduleOptions.useFactory!(...args);
            result.logger = result.logger || new Logger(result.name);
            return result;
          },
        },
      ],
    });
  }

  protected static _getDynamicModule(
    moduleOptions: OpraKafkaModule.ModuleOptions | OpraKafkaModule.AsyncModuleOptions,
  ): DynamicModule {
    const token = moduleOptions.id || KafkaAdapter;
    const adapterProvider = {
      provide: token,
      inject: [ModuleRef, OPRA_KAFKA_MODULE_CONFIG],
      useFactory: async (moduleRef: ModuleRef, config: OpraKafkaModule.ApiConfig) => {
        const interceptors = moduleOptions.interceptors
          ? moduleOptions.interceptors.map(x => {
              if (isConstructor(x)) {
                return async (ctx: KafkaContext, next: KafkaAdapter.NextCallback) => {
                  const interceptor = moduleRef.get(x);
                  if (typeof interceptor.intercept === 'function') return interceptor.intercept(ctx, next);
                };
              }
              return x;
            })
          : undefined;
        return new KafkaAdapter({ ...config, interceptors });
      },
    };
    return {
      global: moduleOptions.global,
      module: OpraKafkaCoreModule,
      controllers: moduleOptions.controllers,
      providers: [
        ...(moduleOptions?.providers || []),
        adapterProvider,
        {
          provide: opraKafkaNestjsAdapterToken,
          useExisting: token,
        },
      ],
      imports: [...(moduleOptions?.imports || [])],
      exports: [...(moduleOptions?.exports || []), adapterProvider],
    };
  }

  async onModuleInit() {
    /** Check if not initialized before */
    if (!this.adapter.document) {
      await initializeAdapter(this.moduleRef, this.adapter, this.config);
    }
  }

  async onApplicationBootstrap() {
    if (this.adapter.document) await this.adapter.start();
  }

  async onApplicationShutdown() {
    await this.adapter.close();
  }
}
