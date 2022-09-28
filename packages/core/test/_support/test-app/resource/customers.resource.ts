import { OprEntityResource } from '@opra/schema';
import {
  EntityResourceController, IEntityService, JsonDataService
} from '../../../../src/index.js';
import customersData from '../data/customers.data.js';
import { Customer } from '../entities/customer.entity.js';

@OprEntityResource(Customer, {
  description: 'Customer resource',
})
export class CustomersResource extends EntityResourceController<Customer> {

  customersService = new JsonDataService({
    resourceName: 'Customers',
    data: customersData,
    primaryKey: 'id'
  });

  getService(): IEntityService {
    return this.customersService;
  }

}
