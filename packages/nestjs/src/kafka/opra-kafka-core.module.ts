import { isConstructor } from '@jsopen/objects';
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
import { ApiDocumentFactory } from '@opra/common';
import { KafkaAdapter, type KafkaContext } from '@opra/kafka';
import { OPRA_KAFKA_MODULE_CONFIG } from '../constants.js';
import { RpcControllerFactory } from '../helpers/rpc-controller-factory.service.js';
import type { OpraKafkaModule } from './opra-kafka.module.js';

const opraKafkaNestjsAdapterToken = Symbol('OpraKafkaNestjsAdapter');

@Module({})
@Global()
export class OpraKafkaCoreModule implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private controllerFactory: RpcControllerFactory,
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
      inject: [RpcControllerFactory, ModuleRef, OPRA_KAFKA_MODULE_CONFIG],
      useFactory: async (
        controllerFactory: RpcControllerFactory,
        moduleRef: ModuleRef,
        config: OpraKafkaModule.ApiConfig,
      ) => {
        const controllers = controllerFactory.exploreControllers().map(x => x.wrapper.instance.constructor);
        const document = await ApiDocumentFactory.createDocument({
          info: config.info,
          types: config.types,
          references: config.references,
          api: {
            name: config.name,
            description: config.description,
            transport: 'rpc',
            platform: 'kafka',
            controllers,
          },
        });

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
        return new KafkaAdapter(document, { ...config, interceptors });
      },
    };
    return {
      global: moduleOptions.global,
      module: OpraKafkaCoreModule,
      controllers: moduleOptions.controllers,
      providers: [
        ...(moduleOptions?.providers || []),
        RpcControllerFactory,
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

  onModuleInit(): any {
    /** NestJS initialize controller instances on init stage.
     * So we should update instance properties */
    const rpcApi = this.adapter.document.rpcApi;
    const controllers = Array.from(rpcApi.controllers.values());
    for (const { wrapper } of this.controllerFactory.exploreControllers().values()) {
      const ctor = wrapper.instance.constructor;
      const controller = controllers.find(x => x.ctor === ctor);
      if (controller) {
        controller.instance = wrapper.instance;
      }
    }
  }

  async onApplicationBootstrap() {
    await this.adapter.start();
  }

  async onApplicationShutdown() {
    await this.adapter.close();
  }
}
