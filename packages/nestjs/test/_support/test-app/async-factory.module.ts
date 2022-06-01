import {Module} from '@nestjs/common';
import {OpraModule} from '@opra/nestjs';
import config from './opra-config.js';
import {CustomerModule} from './svc1/customer/customer.module.js';

@Module({
  imports: [
    OpraModule.forRootAsync({
      useFactory: async () => config,
    }),
    CustomerModule,
  ],
})
export class AsyncOptionsFactoryModule {
}
