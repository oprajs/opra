import { DynamicModule, Module } from '@nestjs/common';
import { OpraModuleAsyncOptions, OpraModuleOptions } from './interfaces/opra-module-options.interface.js';
import { OpraCoreModule } from './opra-core.module.js';

@Module({})
export class OpraModule {
  static forRoot(options: OpraModuleOptions & Pick<DynamicModule, 'imports' | 'providers' | 'exports'>): DynamicModule {
    return {
      module: OpraModule,
      imports: [OpraCoreModule.forRoot(options)]
    };
  }

  static forRootAsync(asyncOptions: OpraModuleAsyncOptions): DynamicModule {
    return {
      module: OpraModule,
      imports: [OpraCoreModule.forRootAsync(asyncOptions)]
    };
  }
}
