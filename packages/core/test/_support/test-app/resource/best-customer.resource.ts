import {
  OprSingletonResource,
} from '@opra/common';
import { SingleRequestContext } from '../../../../src/index.js';
import { ISingletonResource } from '../../../../src/interfaces/resource.interface.js';
import { Customer } from '../entities/customer.entity.js';

@OprSingletonResource(Customer, {
  description: 'Best Customer resource'
})
export class BestCustomerResource implements ISingletonResource<Customer> {

  get(ctx: SingleRequestContext, options: any) {
    return new Customer();
  }

}
