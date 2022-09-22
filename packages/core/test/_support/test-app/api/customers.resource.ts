import {
  ApiEntityResource, EntityResourceController, IEntityService, JsonDataService
} from '../../../../src/index.js';
import customersData from '../data/customers.data.js';
import { Customer } from '../dto/customer.dto.js';

@ApiEntityResource(Customer, {
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
