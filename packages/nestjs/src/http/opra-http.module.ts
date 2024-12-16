import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { HttpAdapter } from '@opra/http';
import { OpraHttpCoreModule } from './opra-http-core.module.js';

export namespace OpraHttpModule {
  export interface ModuleOptions extends BaseModuleOptions, ApiConfig {}

  export interface AsyncModuleOptions extends BaseModuleOptions {
    inject?: any[];
    useFactory?: (...args: any[]) => Promise<ApiConfig> | ApiConfig;
  }

  interface BaseModuleOptions
    extends Pick<
      DynamicModule,
      'imports' | 'providers' | 'exports' | 'controllers' | 'global'
    > {
    token?: any;
    basePath?: string;
    schemaIsPublic?: boolean;
    interceptors?: (
      | HttpAdapter.InterceptorFunction
      | HttpAdapter.IHttpInterceptor
      | Type<HttpAdapter.IHttpInterceptor>
    )[];
  }

  export interface ApiConfig
    extends Pick<
      ApiDocumentFactory.InitArguments,
      'types' | 'references' | 'info'
    > {
    name: string;
    description?: string;
    scopes?: string[];
    logger?: Logger;
  }
}

@Module({})
export class OpraHttpModule {
  /**
   *
   * @param init
   */
  static forRoot(init: OpraHttpModule.ModuleOptions): DynamicModule {
    return {
      module: OpraHttpModule,
      imports: [OpraHttpCoreModule.forRoot(init)],
    };
  }

  /**
   *
   * @param options
   */
  static forRootAsync(
    options: OpraHttpModule.AsyncModuleOptions,
  ): DynamicModule {
    return {
      module: OpraHttpModule,
      imports: [OpraHttpCoreModule.forRootAsync(options)],
    };
  }
}
