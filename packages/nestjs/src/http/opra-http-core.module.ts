import { isConstructor } from '@jsopen/objects';
import {
  type DynamicModule,
  Global,
  Logger,
  type MiddlewareConsumer,
  Module,
  type NestModule,
  type OnModuleDestroy,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER, ModuleRef } from '@nestjs/core';
import { ApiDocumentFactory } from '@opra/common';
import { HttpAdapter, HttpContext } from '@opra/http';
import { OPRA_HTTP_API_CONFIG } from '../constants.js';
import type { OpraHttpModule } from './opra-http.module.js';
import { OpraHttpNestjsAdapter } from './opra-http-nestjs-adapter.js';
import { OpraExceptionFilter } from './services/opra-exception-filter.js';
import { OpraMiddleware } from './services/opra-middleware.js';

const opraHttpNestjsAdapterToken = Symbol('OpraHttpNestjsAdapter');

@Module({})
@Global()
export class OpraHttpCoreModule implements OnModuleDestroy, NestModule {
  constructor(protected opraAdapter: OpraHttpNestjsAdapter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OpraMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }

  static forRoot(moduleOptions: OpraHttpModule.ModuleOptions): DynamicModule {
    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_HTTP_API_CONFIG,
          useValue: { ...moduleOptions },
        },
      ],
    });
  }

  static forRootAsync(moduleOptions: OpraHttpModule.AsyncModuleOptions): DynamicModule {
    if (!moduleOptions.useFactory) throw new Error('Invalid configuration. Must provide "useFactory"');
    return this._getDynamicModule({
      ...moduleOptions,
      providers: [
        ...(moduleOptions?.providers || []),
        {
          provide: OPRA_HTTP_API_CONFIG,
          inject: moduleOptions.inject,
          useFactory: moduleOptions.useFactory,
        },
      ],
    });
  }

  protected static _getDynamicModule(
    moduleOptions: OpraHttpModule.ModuleOptions | OpraHttpModule.AsyncModuleOptions,
  ): DynamicModule {
    const token = moduleOptions?.token || OpraHttpNestjsAdapter;
    const opraNestAdapter = new OpraHttpNestjsAdapter({
      ...moduleOptions,
      interceptors: undefined,
    });

    const adapterProvider = {
      provide: token,
      inject: [ModuleRef, OPRA_HTTP_API_CONFIG],
      useFactory: async (moduleRef: ModuleRef, apiConfig: OpraHttpModule.ApiConfig) => {
        opraNestAdapter.logger = opraNestAdapter.logger || new Logger(apiConfig.name);
        (opraNestAdapter as any)._document = await ApiDocumentFactory.createDocument({
          ...apiConfig,
          api: {
            transport: 'http',
            name: apiConfig.name,
            description: apiConfig.description,
            controllers: moduleOptions.controllers as any,
          },
        });
        if (moduleOptions.interceptors) {
          opraNestAdapter.interceptors = moduleOptions.interceptors.map(x => {
            if (isConstructor(x)) {
              return async (ctx: HttpContext, next: HttpAdapter.NextCallback) => {
                const interceptor = moduleRef.get(x);
                if (typeof interceptor.intercept === 'function') return interceptor.intercept(ctx, next);
              };
            }
            return x;
          });
        }
        return opraNestAdapter;
      },
    };

    return {
      global: moduleOptions.global,
      module: OpraHttpCoreModule,
      controllers: opraNestAdapter.nestControllers,
      providers: [
        ...(moduleOptions?.providers || []),
        adapterProvider,
        {
          provide: opraHttpNestjsAdapterToken,
          useExisting: token,
        },
        {
          provide: APP_FILTER,
          useClass: OpraExceptionFilter,
        },
      ],
      imports: [...(moduleOptions?.imports || [])],
      exports: [...(moduleOptions?.exports || []), adapterProvider],
    };
  }

  async onModuleDestroy() {
    await this.opraAdapter.close();
  }
}
