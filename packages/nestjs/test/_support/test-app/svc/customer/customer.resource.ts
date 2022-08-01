import { Customer } from './customer.dto.js';
import { CustomerService } from './customer.service.js';

@CollectionResource(Customer)
export class CustomerResource {
  constructor(public customerService: CustomerService) {
  }

  @CollectionResource.Read()
  read(query) {
    return this.customerService.get(query);
  }

  @CollectionResource.List()
  search(query) {
    return this.customerService.findAll(query);
  }

}
