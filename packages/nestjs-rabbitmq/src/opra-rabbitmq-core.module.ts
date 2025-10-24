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
import { MQControllerFactory } from '@opra/nestjs';
import { RabbitmqAdapter, type RabbitmqContext } from '@opra/rabbitmq';
import { OPRA_RMQ_MODULE_CONFIG } from './constants.js';
import type { OpraRabbitmqModule } from './opra-rabbitmq.module.js';

const opraRabbitmqNestjsAdapterToken = Symbol('OpraRabbitmqNestjsAdapter');

@Module({})
@Global()
export class OpraRabbitmqCoreModule
  implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private controllerFactory: MQControllerFactory,
    @Inject(opraRabbitmqNestjsAdapterToken)
    protected adapter: RabbitmqAdapter,
    @Inject(OPRA_RMQ_MODULE_CONFIG)
    protected config: OpraRabbitmqModule.ApiConfig,
  ) {}

  static forRoot(
    moduleOptions: OpraRabbitmqModule.ModuleOptions,
  ): DynamicModule {
    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_RMQ_MODULE_CONFIG,
          useValue: {
            ...moduleOptions,
            logger: moduleOptions.logger || new Logger(moduleOptions.name),
          },
        },
      ],
    });
  }

  static forRootAsync(
    moduleOptions: OpraRabbitmqModule.AsyncModuleOptions,
  ): DynamicModule {
    if (!moduleOptions.useFactory)
      throw new Error('Invalid configuration. Must provide "useFactory"');

    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_RMQ_MODULE_CONFIG,
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
    moduleOptions:
      | OpraRabbitmqModule.ModuleOptions
      | OpraRabbitmqModule.AsyncModuleOptions,
  ): DynamicModule {
    const token = moduleOptions.id || RabbitmqAdapter;
    const adapterProvider = {
      provide: token,
      inject: [MQControllerFactory, ModuleRef, OPRA_RMQ_MODULE_CONFIG],
      useFactory: async (
        controllerFactory: MQControllerFactory,
        moduleRef: ModuleRef,
        config: OpraRabbitmqModule.ApiConfig,
      ) => {
        const controllers = controllerFactory
          .exploreControllers()
          .map(x => x.wrapper.instance.constructor);
        const document = await ApiDocumentFactory.createDocument({
          info: config.info,
          types: config.types,
          references: config.references,
          api: {
            name: config.name,
            description: config.description,
            transport: 'mq',
            platform: RabbitmqAdapter.PlatformName,
            controllers,
          },
        });

        const interceptors = moduleOptions.interceptors
          ? moduleOptions.interceptors.map(x => {
              if (isConstructor(x)) {
                return async (
                  ctx: RabbitmqContext,
                  next: RabbitmqAdapter.NextCallback,
                ) => {
                  const interceptor = moduleRef.get(x);
                  if (typeof interceptor.intercept === 'function')
                    return interceptor.intercept(ctx, next);
                };
              }
              return x;
            })
          : undefined;
        return new RabbitmqAdapter(document, { ...config, interceptors });
      },
    };
    return {
      global: moduleOptions.global,
      module: OpraRabbitmqCoreModule,
      controllers: moduleOptions.controllers,
      providers: [
        ...(moduleOptions?.providers || []),
        MQControllerFactory,
        adapterProvider,
        {
          provide: opraRabbitmqNestjsAdapterToken,
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
    const mqApi = this.adapter.document.mqApi;
    const controllers = Array.from(mqApi.controllers.values());
    for (const { wrapper } of this.controllerFactory
      .exploreControllers()
      .values()) {
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
