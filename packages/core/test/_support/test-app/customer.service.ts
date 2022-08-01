import { Injectable } from '@nestjs/common';
// import { JsonResourceService } from '@opra/core';
import { Customer } from '../dto/customer.dto.js';
import customerData from './customers.data.js';

@Injectable()
export class CustomerService
//    extends JsonResourceService<Customer>
{

  constructor() {
    // super(Customer, customerData);
  }

}
