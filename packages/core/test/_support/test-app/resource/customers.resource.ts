import {
  EntityResource,
  OpraResource,
  OprDeleteResolver,
  OprEntityResource,
  OprSearchResolver
} from '@opra/schema';
import { EntityResourceController, IEntityService, JsonCollectionService } from '../../../../src/index.js';
import { customersData } from '../data/customers.data.js';
import { Customer } from '../entities/customer.entity.js';

@OprEntityResource(Customer, {
  description: 'Customer resource',
  keyFields: 'id'
})
export class CustomersResource extends EntityResourceController<Customer> {

  customersService: JsonCollectionService<Customer>;

  @OprSearchResolver({
    sortFields: ['id', 'givenName', 'familyName', 'gender', 'birthDate'],
    defaultSort: ['givenName'],
    filters: [
      {field: 'id', operators: ['=']},
      {field: 'countryCode', operators: ['=', 'in', '!in']},
      {field: 'city', operators: ['=', 'like', '!like']},
      {field: 'vip'},
    ]
  })
  search;

  @OprDeleteResolver()
  delete;

  init(resource: OpraResource) {
    this.customersService = new JsonCollectionService<Customer>(resource as EntityResource,
        {resourceName: 'Customers', data: customersData});
  }

  getService(): IEntityService {
    return this.customersService;
  }

}
