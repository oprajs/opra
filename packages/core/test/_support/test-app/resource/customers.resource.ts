import '@opra/core';
import {
  Collection,
} from '@opra/common';
import { Customer, CustomerNotes } from '../../../../../common/test/_support/test-doc/index.js';

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: 'id'
})
export class CustomersResource {
  public initialized = false;
  public closed = false;

  @Collection.CreateOperation()
  create() {
    return new CustomerNotes();
  }

  @Collection.GetOperation()
  get() {
    return new CustomerNotes();
  }

  @Collection.DeleteOperation()
  delete() {
    return true;
  }

  @Collection.DeleteManyOperation()
  deleteMany() {
    return 1;
  }

  @Collection.UpdateOperation()
  update() {
    return new CustomerNotes();
  }

  @Collection.UpdateManyOperation()
  updateMany() {
    return 1;
  }

  @Collection.SearchOperation({
    sortFields: ['id', 'givenName', 'familyName', 'gender', 'birthDate', 'address.city'],
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

  @Collection.OnInit()
  onInit() {
    this.initialized = true;
  }

  @Collection.OnShutdown()
  onShutdown() {
    this.closed = true;
  }

}
