import * as http from 'node:http';
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
import { HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { ApiDocumentFactory } from '@opra/common';
import { WSControllerFactory } from '@opra/nestjs';
import { SocketioAdapter, type SocketioContext } from '@opra/socketio';
import { OPRA_SOCKETIO_MODULE_OPTIONS } from './constants.js';
import type { OpraSocketioModule } from './opra-socketio.module.js';

const opraSocketioNestjsAdapterToken = Symbol('OpraSocketioNestjsAdapter');

@Module({})
@Global()
export class OpraSocketioCoreModule
  implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private controllerFactory: WSControllerFactory,
    @Inject(opraSocketioNestjsAdapterToken)
    protected adapter: SocketioAdapter,
    @Inject(OPRA_SOCKETIO_MODULE_OPTIONS)
    protected config: OpraSocketioModule.ModuleOptions,

    private httpAdapterHost: HttpAdapterHost,
  ) {}

  static forRoot(
    moduleOptions: OpraSocketioModule.ModuleOptions,
  ): DynamicModule {
    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_SOCKETIO_MODULE_OPTIONS,
          useValue: {
            ...moduleOptions,
            logger: moduleOptions.logger || new Logger(moduleOptions.name),
          },
        },
      ],
    });
  }

  static forRootAsync(
    moduleOptions: OpraSocketioModule.AsyncModuleOptions,
  ): DynamicModule {
    if (!moduleOptions.useFactory)
      throw new Error('Invalid configuration. Must provide "useFactory"');

    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_SOCKETIO_MODULE_OPTIONS,
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
      | OpraSocketioModule.ModuleOptions
      | OpraSocketioModule.AsyncModuleOptions,
  ): DynamicModule {
    const token = moduleOptions.token || SocketioAdapter;
    const adapterProvider = {
      provide: token,
      inject: [WSControllerFactory, ModuleRef, OPRA_SOCKETIO_MODULE_OPTIONS],
      useFactory: async (
        controllerFactory: WSControllerFactory,
        moduleRef: ModuleRef,
        config: OpraSocketioModule.ApiConfig,
      ) => {
        const controllers = controllerFactory
          .exploreControllers()
          .map(x => x.wrapper.instance);
        const document = await ApiDocumentFactory.createDocument({
          info: config.info,
          types: config.types,
          references: config.references,
          api: {
            name: config.name,
            description: config.description,
            transport: 'ws',
            platform: SocketioAdapter.PlatformName,
            controllers,
          },
        });

        const interceptors = moduleOptions.interceptors
          ? moduleOptions.interceptors.map(x => {
              if (isConstructor(x)) {
                return async (
                  ctx: SocketioContext,
                  next: SocketioAdapter.NextCallback,
                ) => {
                  const interceptor = moduleRef.get(x);
                  if (typeof interceptor.intercept === 'function')
                    return interceptor.intercept(ctx, next);
                };
              }
              return x;
            })
          : undefined;
        return new SocketioAdapter(document, { ...config, interceptors });
      },
    };
    return {
      global: moduleOptions.global,
      module: OpraSocketioCoreModule,
      controllers: moduleOptions.controllers,
      providers: [
        ...(moduleOptions?.providers || []),
        WSControllerFactory,
        adapterProvider,
        {
          provide: opraSocketioNestjsAdapterToken,
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
    const wsApi = this.adapter.document.getWsApi();
    const controllers = Array.from(wsApi.controllers.values());
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
    const httpServer: http.Server =
      this.httpAdapterHost.httpAdapter.getHttpServer();
    if (this.config.port) {
      const addr = httpServer.address();
      const httpPort = addr && typeof addr === 'object' ? addr.port : 0;
      if (httpPort !== this.config.port) {
        this.adapter.listen(this.config.port, this.config.serverOptions);
        return;
      }
    }
    this.adapter.listen(httpServer, this.config.serverOptions);
  }

  async onApplicationShutdown() {
    await this.adapter.close();
  }
}
