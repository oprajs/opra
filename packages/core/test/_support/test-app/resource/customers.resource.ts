import {
  CollectionResourceInfo,
  OprCollectionResource,
  OprSearchResolver
} from '@opra/common';
import { SingleRequestContext } from '../../../../src/index.js';
import { ICollectionResource } from '../../../../src/interfaces/resource.interface.js';
import { Customer } from '../entities/customer.entity.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@OprCollectionResource(Customer, {
  description: 'Customer resource',
  keyFields: 'id'
})
export class CustomersResource implements ICollectionResource<CustomerNotes> {
  public initialized = false;
  public closed = false;

  create(ctx: SingleRequestContext, data, options: any) {
    return new CustomerNotes();
  }

  get(ctx: SingleRequestContext, keyValue, options: any) {
    return new CustomerNotes();
  }

  count(ctx: SingleRequestContext, options: any) {
    return 1;
  }

  delete(ctx: SingleRequestContext, keyValue: any) {
    return true;
  }

  deleteMany(ctx: SingleRequestContext, options: any) {
    return 1;
  }

  update(ctx: SingleRequestContext, keyValue, data, options) {
    return new CustomerNotes();
  }

  updateMany(ctx: SingleRequestContext, data, options) {
    return 1;
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
    return [new CustomerNotes()];
  }

  init(resource: CollectionResourceInfo) {
    this.initialized = true;
  }

  shutDown() {
    this.closed = true;
  }

}
