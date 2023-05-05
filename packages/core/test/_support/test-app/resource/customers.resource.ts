import '@opra/core';
import { Collection } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: '_id'
})
export class CustomersResource {
  public initialized = false;
  public closed = false;

  @Collection.Create()
  create() {
    return new Customer();
  }

  @Collection.Get()
  get() {
    return new Customer();
  }

  @Collection.Delete()
  delete() {
    return true;
  }

  @Collection.DeleteMany()
  deleteMany() {
    return 1;
  }

  @Collection.Update()
  update() {
    return new Customer();
  }

  @Collection.UpdateMany()
  updateMany() {
    return 1;
  }

  @Collection.FindMany({
    sortFields: ['_id', 'givenName', 'familyName', 'gender', 'birthDate', 'address.countryCode'],
    defaultSort: ['givenName'],
    filters: [
      {field: '_id', operators: ['=']},
      {field: 'countryCode', operators: ['=', 'in', '!in']},
      {field: 'givenName', operators: ['=', 'like', '!like']},
      {field: 'familyName', operators: ['=', 'like', '!like']},
      {field: 'gender', operators: ['=']}
    ]
  })
  search() {
    return [new Customer()];
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
