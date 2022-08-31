import { Injectable } from '@nestjs/common';
// import { JsonResourceService } from '@opra/core';
import { Customer } from '../dto/customer.dto';
import customerData from '../data/customers.data';

@Injectable()
export class CustomerService
//    extends JsonResourceService<Customer>
{

  constructor() {
    // super(Customer, customerData);
  }

}
