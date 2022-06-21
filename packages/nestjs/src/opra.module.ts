import {DynamicModule, Module} from '@nestjs/common';
import {OpraModuleAsyncOptions, OpraModuleOptions} from './interfaces/opra-module-options.interface.js';
import {OpraCoreModule} from './opra-core.module.js';
import {ModuleThunk} from './types';

@Module({})
export class OpraModule {
  static forRoot(serviceModule: ModuleThunk, options: OpraModuleOptions): DynamicModule {
    return {
      module: OpraModule,
      imports: [OpraCoreModule.forRoot(serviceModule, options)]
    };
  }

  static forRootAsync(serviceModule: ModuleThunk, asyncOptions: OpraModuleAsyncOptions): DynamicModule {
    return {
      module: OpraModule,
      imports: [OpraCoreModule.forRootAsync(serviceModule, asyncOptions)]
    };
  }
}
