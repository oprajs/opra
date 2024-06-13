import { DynamicModule, Module } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import { OpraHttpCoreModule } from './opra-http-core.module.js';

export namespace OpraHttpModule {
  export interface Options
    extends Pick<DynamicModule, 'imports' | 'providers' | 'exports' | 'controllers'>,
      Pick<ApiDocumentFactory.InitArguments, 'types' | 'references' | 'info'> {
    id?: any;
    name: string;
    basePath?: string;
  }
}

@Module({})
export class OpraHttpModule {
  /**
   *
   * @param options
   */
  static forRoot(options: OpraHttpModule.Options): DynamicModule {
    return {
      module: OpraHttpModule,
      imports: [OpraHttpCoreModule.forRoot(options)],
    };
  }
}
