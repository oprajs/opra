import { HttpOperation, HttpResource } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@HttpResource({
  description: 'Customer resource',
  name: 'Customers'
}).KeyParameter('_id')
export class CustomerController {

  @HttpOperation.Entity.Get(Customer, 'id')
  get() {
    //
  }

}
