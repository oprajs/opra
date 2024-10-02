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
import { KafkaAdapter, KafkaContext } from '@opra/kafka';
import { OPRA_KAFKA_MODULE_CONFIG } from '../constants.js';
import type { OpraKafkaModule } from './opra-kafka.module.js';
import { OpraKafkaNestjsAdapter } from './opra-kafka-nestjs-adapter.js';

const opraKafkaNestjsAdapterToken = Symbol('OpraKafkaNestjsAdapter');

@Module({})
@Global()
export class OpraKafkaCoreModule implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(opraKafkaNestjsAdapterToken)
    protected adapter: OpraKafkaNestjsAdapter,
    @Inject(OPRA_KAFKA_MODULE_CONFIG)
    protected init: OpraKafkaModule.ApiConfig,
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
    const token = moduleOptions.id || OpraKafkaNestjsAdapter;
    const adapterProvider = {
      provide: token,
      inject: [ModuleRef, OPRA_KAFKA_MODULE_CONFIG],
      useFactory: async (moduleRef: ModuleRef, config: OpraKafkaModule.ApiConfig) => {
        const adapter = new OpraKafkaNestjsAdapter(moduleRef);
        await adapter.initialize(config);
        if (moduleOptions.interceptors) {
          adapter.adapter.interceptors = moduleOptions.interceptors.map(x => {
            if (isConstructor(x)) {
              return async (ctx: KafkaContext, next: KafkaAdapter.NextCallback) => {
                const interceptor = moduleRef.get(x);
                if (typeof interceptor.intercept === 'function') return interceptor.intercept(ctx, next);
              };
            }
            return x;
          });
        }
        return adapter;
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
    await this.adapter.initialize(this.init);
  }

  async onApplicationBootstrap() {
    await this.adapter.start();
  }

  async onApplicationShutdown() {
    await this.adapter.stop();
  }
}
