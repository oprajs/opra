import {DynamicModule, Module} from '@nestjs/common';
import {OpraModuleAsyncOptions, OpraModuleOptions} from './opra.interface';
import {OpraCoreModule} from './opra-core.module';

@Module({})
export class OpraModule {
  static forRoot(options?: OpraModuleOptions): DynamicModule {
    return {
      module: OpraModule,
      imports: [OpraCoreModule.forRoot(options)]
    };
  }

  static forRootAsync(options: OpraModuleAsyncOptions): DynamicModule {
    return {
      module: OpraModule,
      imports: [OpraCoreModule.forRootAsync(options)]
    };
  }
}
