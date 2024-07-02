import { DynamicModule, Module } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { OpraHttpCoreModule } from './opra-http-core.module.js';

export namespace OpraHttpModule {
  export interface Initiator
    extends Pick<DynamicModule, 'imports' | 'providers' | 'exports' | 'controllers'>,
      Pick<ApiDocumentFactory.InitArguments, 'types' | 'references' | 'info'> {
    id?: any;
    name: string;
  }

  export interface Options {
    basePath?: string;
    schemaRouteIsPublic?: boolean;
  }
}

@Module({})
export class OpraHttpModule {
  /**
   *
   * @param init
   * @param options
   */
  static forRoot(init: OpraHttpModule.Initiator, options?: OpraHttpModule.Options): DynamicModule {
    return {
      module: OpraHttpModule,
      imports: [OpraHttpCoreModule.forRoot(init, options)],
    };
  }
}
