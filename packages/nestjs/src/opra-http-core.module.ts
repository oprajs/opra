import { asMutable } from 'ts-gems';
import { DynamicModule, Global, Module, OnModuleDestroy } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import type { OpraHttpModule } from './opra-http.module';
import { OpraNestAdapter } from './opra-nestjs-adapter.js';

@Module({})
@Global()
export class OpraHttpCoreModule implements OnModuleDestroy {
  constructor(protected opraAdapter: OpraNestAdapter) {}

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
            api: { protocol: 'http', name: options.name, controllers: opraAdapter.controllers },
          });
          return opraAdapter;
        },
      },
    ];
    if (token !== OpraNestAdapter)
      providers.push({
        provide: token,
        useValue: opraAdapter,
      });
    return {
      module: OpraHttpCoreModule,
      controllers: opraAdapter.controllers,
      imports: [...(options?.imports || [])],
      exports: [...(options?.exports || []), token],
      providers,
    };
  }

  async onModuleDestroy() {
    await this.opraAdapter.close();
  }
}
