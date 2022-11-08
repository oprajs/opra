import {
  CollectionResourceInfo,
  OprCollectionResource,
  OprSearchResolver
} from '@opra/schema';
import { JsonCollectionService, QueryContext } from '../../../../src/index.js';
import { ICollectionResource } from '../../../../src/interfaces/resource.interface.js';
import { customersData } from '../data/customers.data.js';
import { Customer } from '../entities/customer.entity.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprCollectionResource(Customer, {
  description: 'Customer resource',
  keyFields: 'id'
})
export class CustomersResource implements ICollectionResource<CustomerNotes> {

  service: JsonCollectionService<Customer>;

  create(ctx: QueryContext, data, options: any) {
    return this.service.create(data, options);
  }

  get(ctx: QueryContext, keyValue, options: any) {
    return this.service.get(keyValue, options);
  }

  count(ctx: QueryContext, options: any) {
    return this.service.count(options);
  }

  delete(ctx: QueryContext, keyValue: any) {
    return this.service.delete(keyValue);
  }

  deleteMany(ctx: QueryContext, options: any) {
    return this.service.deleteMany(options);
  }

  update(ctx: QueryContext, keyValue, data, options) {
    return this.service.update(keyValue, data, options);
  }

  updateMany(ctx: QueryContext, data, options) {
    return this.service.updateMany(data, options);
  }

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
  search(ctx: QueryContext, options: any) {
    return this.service.search(options);
  }

  init(resource: CollectionResourceInfo) {
    this.service = new JsonCollectionService<Customer>(resource,
        {resourceName: 'Customers', data: customersData});
  }


}
