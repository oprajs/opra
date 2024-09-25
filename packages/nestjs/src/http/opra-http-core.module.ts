import {
  type DynamicModule,
  Global,
  type MiddlewareConsumer,
  Module,
  type NestModule,
  type OnModuleDestroy,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER, ModuleRef } from '@nestjs/core';
import { ApiDocumentFactory, isConstructor } from '@opra/common';
import type { ExecutionContext } from '@opra/core';
import type { HttpAdapter } from '@opra/http';
import { asMutable } from 'ts-gems';
import { OPRA_HTTP_MODULE_OPTIONS } from '../constants.js';
import type { OpraHttpModule } from './opra-http.module.js';
import { OpraHttpNestjsAdapter } from './opra-http-nestjs-adapter.js';
import { OpraExceptionFilter } from './services/opra-exception-filter.js';
import { OpraMiddleware } from './services/opra-middleware.js';

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

  static forRoot(init: OpraHttpModule.Initiator): DynamicModule {
    const opraAdapter = new OpraHttpNestjsAdapter(init);
    const token = init?.id || OpraHttpNestjsAdapter;

    const providers = [
      ...(init?.providers || []),
      {
        provide: OPRA_HTTP_MODULE_OPTIONS,
        useValue: { ...init.options },
      },
      {
        provide: token,
        inject: [ModuleRef],
        useFactory: async (moduleRef: ModuleRef) => {
          asMutable(opraAdapter).document = await ApiDocumentFactory.createDocument({
            ...init,
            api: { transport: 'http', name: init.name, controllers: init.controllers as any },
          });
          opraAdapter.interceptors.map(x => {
            if (isConstructor(x)) {
              return (ctx: ExecutionContext, next: HttpAdapter.NextCallback) => {
                const interceptor = moduleRef.get(x);
                if (typeof interceptor.intercept === 'function') return interceptor.intercept(ctx, next());
              };
            }
            return x;
          });
          return opraAdapter;
        },
      },
      {
        provide: APP_FILTER,
        useClass: OpraExceptionFilter,
      },
    ];
    if (token !== OpraHttpNestjsAdapter) {
      providers.push({
        provide: token,
        useValue: opraAdapter,
      });
    }
    return {
      module: OpraHttpCoreModule,
      controllers: opraAdapter.nestControllers,
      imports: [...(init?.imports || [])],
      exports: [...(init?.exports || []), token],
      providers,
    };
  }

  async onModuleDestroy() {
    await this.opraAdapter.close();
  }
}
