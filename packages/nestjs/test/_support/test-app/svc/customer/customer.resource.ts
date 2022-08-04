import { Api } from '@opra/core';
import { Customer } from './customer.dto.js';
import { CustomerService } from './customer.service.js';

@Api.Entity(Customer, {
  primaryKey: 'id',
  description: 'Customer resource'
})
export class CustomerResource {

  public customerService: CustomerService;

  constructor() {
    //
  }

  @Api.ReadHandler()
  read(query) {
    // return this.customerService.get(query);
  }

}
