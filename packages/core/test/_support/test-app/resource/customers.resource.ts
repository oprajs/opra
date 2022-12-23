import {
  CollectionResourceInfo,
  OprCollectionResource,
  OprSearchResolver
} from '@opra/common';
import { JsonCollectionService, SingleRequestContext } from '../../../../src/index.js';
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

  create(ctx: SingleRequestContext, data, options: any) {
    return this.service.create(data, options);
  }

  get(ctx: SingleRequestContext, keyValue, options: any) {
    return this.service.get(keyValue, options);
  }

  count(ctx: SingleRequestContext, options: any) {
    return this.service.count(options);
  }

  delete(ctx: SingleRequestContext, keyValue: any) {
    return this.service.delete(keyValue);
  }

  deleteMany(ctx: SingleRequestContext, options: any) {
    return this.service.deleteMany(options);
  }

  update(ctx: SingleRequestContext, keyValue, data, options) {
    return this.service.update(keyValue, data, options);
  }

  updateMany(ctx: SingleRequestContext, data, options) {
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
  search(ctx: SingleRequestContext, options: any) {
    return this.service.search(options);
  }

  init(resource: CollectionResourceInfo) {
    this.service = new JsonCollectionService<Customer>(resource,
        {resourceName: 'Customers', data: customersData});
  }


}
