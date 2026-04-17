import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import type { KafkaAdapter } from '@opra/kafka';
import { OpraKafkaCoreModule } from './opra-kafka-core.module.js';

export namespace OpraKafkaModule {
  /**
   * Synchronous configuration options for OpraKafkaModule.
   */
  export interface ModuleOptions extends BaseModuleOptions, ApiConfig {}

  /**
   * Asynchronous configuration options for OpraKafkaModule.
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
    /** Module ID */
    id?: any;
    /** Interceptor list for the Kafka adapter */
    interceptors?: (
      | KafkaAdapter.InterceptorFunction
      | KafkaAdapter.IKafkaInterceptor
      | Type<KafkaAdapter.IKafkaInterceptor>
    )[];
  }

  /**
   * OPRA Kafka API configuration details.
   */
  export interface ApiConfig
    extends
      Pick<ApiDocumentFactory.InitArguments, 'types' | 'references' | 'info'>,
      Pick<
        KafkaAdapter.Config,
        'client' | 'consumers' | 'logExtra' | 'defaults'
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
 * OpraKafkaModule
 *
 * Module that integrates OPRA Kafka support into the NestJS application.
 */
@Module({})
export class OpraKafkaModule {
  /**
   * Configures the module synchronously and imports it at the root level.
   *
   * @param options - Module configuration options.
   * @returns {DynamicModule} NestJS dynamic module.
   */
  static forRoot(options: OpraKafkaModule.ModuleOptions): DynamicModule {
    return {
      module: OpraKafkaModule,
      imports: [OpraKafkaCoreModule.forRoot(options)],
    };
  }

  /**
   * Configures the module asynchronously and imports it at the root level.
   *
   * @param options - Asynchronous module configuration options.
   * @returns {DynamicModule} NestJS dynamic module.
   */
  static forRootAsync(
    options: OpraKafkaModule.AsyncModuleOptions,
  ): DynamicModule {
    return {
      module: OpraKafkaModule,
      imports: [OpraKafkaCoreModule.forRootAsync(options)],
    };
  }
}
