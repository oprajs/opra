import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import type { ApiDocumentFactory } from '@opra/common';
import type { RabbitmqAdapter } from '@opra/rabbitmq';
import { OpraRabbitmqCoreModule } from './opra-rabbitmq-core.module.js';

export namespace OpraRabbitmqModule {
  /**
   * Synchronous configuration options for OpraRabbitmqModule.
   */
  export interface ModuleOptions extends BaseModuleOptions, ApiConfig {}

  /**
   * Asynchronous configuration options for OpraRabbitmqModule.
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
  interface BaseModuleOptions
    extends Pick<
      DynamicModule,
      'imports' | 'providers' | 'exports' | 'controllers' | 'global'
    > {
    /** Module ID */
    id?: any;
    /** Interceptor list for the RabbitMQ adapter */
    interceptors?: (
      | RabbitmqAdapter.InterceptorFunction
      | RabbitmqAdapter.IRabbitmqInterceptor
      | Type<RabbitmqAdapter.IRabbitmqInterceptor>
    )[];
  }

  /**
   * OPRA RabbitMQ API configuration details.
   */
  export interface ApiConfig
    extends Pick<
      ApiDocumentFactory.InitArguments,
      'types' | 'references' | 'info'
    > {
    /** RabbitMQ connection configuration */
    connection?: RabbitmqAdapter.Config['connection'];
    /** Extra logging configuration */
    logExtra?: RabbitmqAdapter.Config['logExtra'];
    /** Default settings */
    defaults?: RabbitmqAdapter.Config['defaults'];
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
 * OpraRabbitmqModule
 *
 * Module that integrates OPRA RabbitMQ support into the NestJS application.
 */
@Module({})
export class OpraRabbitmqModule {
  /**
   * Configures the module synchronously and imports it at the root level.
   *
   * @param options - Module configuration options.
   * @returns {DynamicModule} NestJS dynamic module.
   */
  static forRoot(options: OpraRabbitmqModule.ModuleOptions): DynamicModule {
    return {
      module: OpraRabbitmqModule,
      imports: [OpraRabbitmqCoreModule.forRoot(options)],
    };
  }

  /**
   * Configures the module asynchronously and imports it at the root level.
   *
   * @param options - Asynchronous module configuration options.
   * @returns {DynamicModule} NestJS dynamic module.
   */
  static forRootAsync(
    options: OpraRabbitmqModule.AsyncModuleOptions,
  ): DynamicModule {
    return {
      module: OpraRabbitmqModule,
      imports: [OpraRabbitmqCoreModule.forRootAsync(options)],
    };
  }
}
