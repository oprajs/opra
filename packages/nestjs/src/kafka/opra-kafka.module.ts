import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { KafkaAdapter } from '@opra/kafka';
import { OpraKafkaCoreModule } from './opra-kafka-core.module.js';

export namespace OpraKafkaModule {
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
    id?: any;
    interceptors?: (
      | KafkaAdapter.InterceptorFunction
      | KafkaAdapter.IKafkaInterceptor
      | Type<KafkaAdapter.IKafkaInterceptor>
    )[];
  }

  export interface ApiConfig
    extends Pick<
        ApiDocumentFactory.InitArguments,
        'types' | 'references' | 'info'
      >,
      Pick<
        KafkaAdapter.Config,
        'client' | 'consumers' | 'logExtra' | 'defaults'
      > {
    name: string;
    description?: string;
    scope?: string;
    logger?: Logger;
  }
}

@Module({})
export class OpraKafkaModule {
  /**
   *
   * @param options
   */
  static forRoot(options: OpraKafkaModule.ModuleOptions): DynamicModule {
    return {
      module: OpraKafkaModule,
      imports: [OpraKafkaCoreModule.forRoot(options)],
    };
  }

  /**
   *
   * @param options
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
