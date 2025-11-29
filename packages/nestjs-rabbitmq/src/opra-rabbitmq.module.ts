import { type DynamicModule, Logger, Module, type Type } from '@nestjs/common';
import { ApiDocumentFactory } from '@opra/common';
import type { RabbitmqAdapter } from '@opra/rabbitmq';
import { OpraRabbitmqCoreModule } from './opra-rabbitmq-core.module.js';

export namespace OpraRabbitmqModule {
  export interface ModuleOptions extends BaseModuleOptions, ApiConfig {}

  export interface AsyncModuleOptions extends BaseModuleOptions {
    inject?: any[];
    useFactory?: (...args: any[]) => Promise<ApiConfig> | ApiConfig;
  }

  interface BaseModuleOptions extends Pick<
    DynamicModule,
    'imports' | 'providers' | 'exports' | 'controllers' | 'global'
  > {
    id?: any;
    interceptors?: (
      | RabbitmqAdapter.InterceptorFunction
      | RabbitmqAdapter.IRabbitmqInterceptor
      | Type<RabbitmqAdapter.IRabbitmqInterceptor>
    )[];
  }

  export interface ApiConfig extends Pick<
    ApiDocumentFactory.InitArguments,
    'types' | 'references' | 'info'
  > {
    connection?: RabbitmqAdapter.Config['connection'];
    logExtra?: RabbitmqAdapter.Config['logExtra'];
    defaults?: RabbitmqAdapter.Config['defaults'];
    name: string;
    description?: string;
    scope?: string;
    logger?: Logger;
  }
}

@Module({})
export class OpraRabbitmqModule {
  /**
   *
   * @param options
   */
  static forRoot(options: OpraRabbitmqModule.ModuleOptions): DynamicModule {
    return {
      module: OpraRabbitmqModule,
      imports: [OpraRabbitmqCoreModule.forRoot(options)],
    };
  }

  /**
   *
   * @param options
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
