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
  imports: [
    OpraModule.forRootAsync({
      useClass: ConfigService,
    }),
    CustomerModule,
  ],
})
export class AsyncOptionsClassModule {
}
