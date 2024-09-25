import { type DynamicModule, Module, type Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { HttpAdapter } from '@opra/http';
import { OpraHttpCoreModule } from './opra-http-core.module.js';

export namespace OpraHttpModule {
  export interface Initiator extends Pick<DynamicModule, 'imports' | 'providers' | 'exports' | 'controllers'> {
    id?: any;
    name: string;
    document?: Pick<ApiDocumentFactory.InitArguments, 'types' | 'references' | 'info'>;
    options?: Options;
  }

  export interface Options {
    basePath?: string;
    schemaRouteIsPublic?: boolean;
    interceptors?: (
      | HttpAdapter.InterceptorFunction
      | HttpAdapter.IHttpInterceptor
      | Type<HttpAdapter.IHttpInterceptor>
    )[];
  }
}

@Module({})
export class OpraHttpModule {
  /**
   *
   * @param init
   */
  static forRoot(init: OpraHttpModule.Initiator): DynamicModule {
    return {
      module: OpraHttpModule,
      imports: [OpraHttpCoreModule.forRoot(init)],
    };
  }
}
