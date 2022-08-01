import {Module} from '@nestjs/common';
import {
  OpraModule,
  OpraModuleOptions,
  OpraModuleOptionsFactory,
} from '@opra/nestjs';
import config from './opra-config.js';
import {CustomerModule} from './svc/customer/customer.module.js';

class ConfigService implements OpraModuleOptionsFactory {
  createOptions(): OpraModuleOptions {
    return config;
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {
}

@Module({
  imports: [
    OpraModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
    CustomerModule,
  ]
})
export class AsyncOptionsExistingModule {
}
