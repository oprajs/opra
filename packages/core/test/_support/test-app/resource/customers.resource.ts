import {
  CollectionResource,
  OpraResource,
  OprCollectionResource,
  OprDeleteResolver,
  OprSearchResolver
} from '@opra/schema';
import { CollectionResourceController, IEntityService, JsonCollectionService } from '../../../../src/index.js';
import { customersData } from '../data/customers.data.js';
import { Customer } from '../entities/customer.entity.js';

@OprCollectionResource(Customer, {
  description: 'Customer resource',
  keyFields: 'id'
})
export class CustomersResource extends CollectionResourceController<Customer> {

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
    this.customersService = new JsonCollectionService<Customer>(resource as CollectionResource,
        {resourceName: 'Customers', data: customersData});
  }

  getService(): IEntityService {
    return this.customersService;
  }

}
