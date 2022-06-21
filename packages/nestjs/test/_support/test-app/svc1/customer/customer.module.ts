import {Module} from '@nestjs/common';
import {CustomerService} from './customer.service.js';
import {CustomerResource} from './customer.resource.js';

@Module({
  providers: [
    CustomerService,
    CustomerResource
  ]
})
export class CustomerModule {
}
