import {DynamicModule, Module} from '@nestjs/common';
import {OpraModule, OpraModuleOptions} from '@opra/nestjs';

@Module({})
export class ExtendedModule {
  static async forRoot(options: OpraModuleOptions): Promise<DynamicModule> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      module: ExtendedModule,
      imports: [
        OpraModule.forRoot(options)
      ]
    };
  }
}
