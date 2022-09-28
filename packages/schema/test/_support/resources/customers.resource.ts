import { OprEntityResource } from '../../../src/index.js';
import { Customer } from '../entities/customer.entity.js';

@OprEntityResource(Customer, {
  description: 'Customer resource',
})
export class CustomersResource {


}
