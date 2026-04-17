import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import type { ApiDocumentFactory } from '@opra/common';
import type { SocketioAdapter } from '@opra/socketio';
import * as socketio from 'socket.io';
import { OpraSocketioCoreModule } from './opra-socketio-core.module.js';

export namespace OpraSocketioModule {
  /**
   * Synchronous configuration options for OpraSocketioModule.
   */
  export interface ModuleOptions extends BaseModuleOptions, ApiConfig {}

  /**
   * Asynchronous configuration options for OpraSocketioModule.
   */
  export interface AsyncModuleOptions extends BaseModuleOptions {
    /** Providers to be injected into the factory function */
    inject?: any[];
    /** Factory function that returns the ApiConfig object asynchronously */
    useFactory?: (...args: any[]) => Promise<ApiConfig> | ApiConfig;
  }

  /**
   * Base configuration options for the module.
   */
  interface BaseModuleOptions extends Pick<
    DynamicModule,
    'imports' | 'providers' | 'exports' | 'controllers' | 'global'
  > {
    /** Custom token for the module */
    token?: any;
    /** Port the Socket.io server will listen on */
    port?: number;
    /** Socket.io server options */
    serverOptions?: Partial<socketio.ServerOptions>;
    /** Interceptor list for the Socket.io adapter */
    interceptors?: (
      | SocketioAdapter.InterceptorFunction
      | SocketioAdapter.IWSInterceptor
      | Type<SocketioAdapter.IWSInterceptor>
    )[];
  }

  /**
   * OPRA Socket.io API configuration details.
   */
  export interface ApiConfig extends Pick<
    ApiDocumentFactory.InitArguments,
    'types' | 'references' | 'info'
  > {
    /** API name */
    name: string;
    /** API description */
    description?: string;
    /** API scope */
    scope?: string;
    /** Logger to be used */
    logger?: Logger;
  }
}

/**
 * OpraSocketioModule
 *
 * Module that integrates OPRA Socket.io support into the NestJS application.
 */
@Module({})
export class OpraSocketioModule {
  /**
   * Configures the module synchronously and imports it at the root level.
   *
   * @param init - Module configuration options.
   * @returns {DynamicModule} NestJS dynamic module.
   */
  static forRoot(init: OpraSocketioModule.ModuleOptions): DynamicModule {
    return {
      module: OpraSocketioModule,
      imports: [OpraSocketioCoreModule.forRoot(init)],
    };
  }

  /**
   * Configures the module asynchronously and imports it at the root level.
   *
   * @param options - Asynchronous module configuration options.
   * @returns {DynamicModule} NestJS dynamic module.
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
