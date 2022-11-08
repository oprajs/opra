import {
  OprSingletonResource,
  SingletonResourceInfo
} from '@opra/schema';
import { JsonSingletonService, QueryContext } from '../../../../src/index.js';
import { ISingletonResource } from '../../../../src/interfaces/resource.interface.js';
import { customersData } from '../data/customers.data.js';
import { Customer } from '../entities/customer.entity.js';

@OprSingletonResource(Customer, {
  description: 'Best Customer resource'
})
export class BestCustomerResource implements ISingletonResource<Customer> {

  service: JsonSingletonService<Customer>;

  get(ctx: QueryContext, options: any) {
    return this.service.get(options);
  }

  init(resource: SingletonResourceInfo) {
    this.service = new JsonSingletonService<Customer>(
        resource.dataType,
        {resourceName: 'Customers', data: customersData[9]});
  }

}
