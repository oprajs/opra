import {
  DynamicModule,
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  RequestMethod,
} from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { asMutable } from 'ts-gems';
import type { OpraHttpModule } from './opra-http.module';
import { OpraNestAdapter } from './opra-nestjs-adapter.js';
import { OpraMiddleware } from './services/opra-middleware.js';

@Module({})
@Global()
export class OpraHttpCoreModule implements OnModuleDestroy, NestModule {
  constructor(protected opraAdapter: OpraNestAdapter) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OpraMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }

  static forRoot(options: OpraHttpModule.Options): DynamicModule {
    const opraAdapter = new OpraNestAdapter(options);
    const token = options?.id || OpraNestAdapter;

    const providers = [
      ...(options?.providers || []),
      {
        provide: OpraNestAdapter,
        useFactory: async () => {
          asMutable(opraAdapter).document = await ApiDocumentFactory.createDocument({
            ...options,
            api: { protocol: 'http', name: options.name, controllers: options.controllers! },
          });
          return opraAdapter;
        },
      },
    ];
    if (token !== OpraNestAdapter) {
      providers.push({
        provide: token,
        useValue: opraAdapter,
      });
    }
    return {
      module: OpraHttpCoreModule,
      controllers: opraAdapter.nestControllers,
      imports: [...(options?.imports || [])],
      exports: [...(options?.exports || []), token],
      providers,
    };
  }

  async onModuleDestroy() {
    await this.opraAdapter.close();
  }
}
