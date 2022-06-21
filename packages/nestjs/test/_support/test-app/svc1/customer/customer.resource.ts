import { ApiCollection, ApiRead } from '@opra/common';
import { Customer } from './customer.dto.js';
import { CustomerService } from './customer.service.js';

@ApiCollection(Customer)
export class CustomerResource {
  constructor(public customerService: CustomerService) {
  }

  @ApiRead()
  read(query) {
    return this.customerService.get(query);
  }

}
