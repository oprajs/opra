import {Module} from '@nestjs/common';
import {CustomerController} from './customer.controller.js';
import {CustomerService} from './customer.service.js';

@Module({
  providers: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {
}
