import {Module} from '@nestjs/common';
import {ExtendedModule} from './extended.module';
import config from './opra-config.js';
import {CustomerModule} from './svc1/customer/customer.module.js';

@Module({
  imports: [ExtendedModule.forRoot(config), CustomerModule],
})
export class AsyncApplicationModule {
}
