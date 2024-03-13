import { HttpOperation, HttpResource } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@HttpResource({
  description: 'Customer resource',
}).KeyParameter('_id')
export class CustomersResource {

  @HttpOperation.Entity.Get(Customer, 'id')
  get() {
    //
  }

}
