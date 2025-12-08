import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import type { ApiDocumentFactory } from '@opra/common';
import type { SocketioAdapter } from '@opra/socketio';
import * as socketio from 'socket.io';
import { OpraSocketioCoreModule } from './opra-socketio-core.module.js';

export namespace OpraSocketioModule {
  export interface ModuleOptions extends BaseModuleOptions, ApiConfig {}

  export interface AsyncModuleOptions extends BaseModuleOptions {
    inject?: any[];
    useFactory?: (...args: any[]) => Promise<ApiConfig> | ApiConfig;
  }

  interface BaseModuleOptions extends Pick<
    DynamicModule,
    'imports' | 'providers' | 'exports' | 'controllers' | 'global'
  > {
    token?: any;
    port?: number;
    serverOptions?: Partial<socketio.ServerOptions>;
    // schemaIsPublic?: boolean;
    interceptors?: (
      | SocketioAdapter.InterceptorFunction
      | SocketioAdapter.IWSInterceptor
      | Type<SocketioAdapter.IWSInterceptor>
    )[];
  }

  export interface ApiConfig extends Pick<
    ApiDocumentFactory.InitArguments,
    'types' | 'references' | 'info'
  > {
    name: string;
    description?: string;
    scope?: string;
    logger?: Logger;
  }
}

@Module({})
export class OpraSocketioModule {
  /**
   *
   * @param init
   */
  static forRoot(init: OpraSocketioModule.ModuleOptions): DynamicModule {
    return {
      module: OpraSocketioModule,
      imports: [OpraSocketioCoreModule.forRoot(init)],
    };
  }

  /**
   *
   * @param options
   */
  static forRootAsync(
    options: OpraSocketioModule.AsyncModuleOptions,
  ): DynamicModule {
    return {
      module: OpraSocketioModule,
      imports: [OpraSocketioCoreModule.forRootAsync(options)],
    };
  }
}
