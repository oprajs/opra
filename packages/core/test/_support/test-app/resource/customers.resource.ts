import {
  OprCollectionResource,
  OprSearchResolver
} from '@opra/common';
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

  create() {
    return new CustomerNotes();
  }

  get() {
    return new CustomerNotes();
  }

  count() {
    return 1;
  }

  delete() {
    return true;
  }

  deleteMany() {
    return 1;
  }

  update() {
    return new CustomerNotes();
  }

  updateMany() {
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
  search() {
    return [new CustomerNotes()];
  }

  init() {
    this.initialized = true;
  }

  shutDown() {
    this.closed = true;
  }

}
