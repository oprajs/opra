import {
  OprSingletonResource,
} from '@opra/common';
import { ISingletonResource } from '../../../../src/interfaces/resource.interface.js';
import { Customer } from '../entities/customer.entity.js';

@OprSingletonResource(Customer, {
  description: 'Best Customer resource'
})
export class BestCustomerResource implements ISingletonResource<Customer> {

  get() {
    return new Customer();
  }

}
