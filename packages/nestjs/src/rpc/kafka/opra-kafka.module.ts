import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { KafkaAdapter } from '@opra/kafka';
import type { StrictOmit } from 'ts-gems';
import { OpraKafkaCoreModule } from './opra-kafka-core.module.js';

export namespace OpraKafkaModule {
  export interface Initiator
    extends Pick<DynamicModule, 'imports' | 'providers' | 'exports' | 'controllers'>,
      StrictOmit<KafkaAdapter.Config, 'document' | 'logger' | 'interceptors'> {
    id?: any;
    name: string;
    description?: string;
    document?: Pick<ApiDocumentFactory.InitArguments, 'references' | 'info'>;
    types?: ApiDocumentFactory.InitArguments['types'];
    logger?: Logger;
    interceptors?: (
      | KafkaAdapter.InterceptorFunction
      | KafkaAdapter.IKafkaInterceptor
      | Type<KafkaAdapter.IKafkaInterceptor>
    )[];
  }
}

@Module({})
export class OpraKafkaModule {
  /**
   *
   * @param init
   */
  static forRoot(init: OpraKafkaModule.Initiator): DynamicModule {
    return {
      module: OpraKafkaModule,
      imports: [OpraKafkaCoreModule.forRoot(init)],
    };
  }
}
