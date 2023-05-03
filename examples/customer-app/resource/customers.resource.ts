import {
  Collection,
} from '@opra/common';
import { Customer } from '../entities/customer.entity.js';
import { CustomerNotes } from '../entities/customer-notes.entity.js';

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: 'id'
})
export class CustomersResource {
  public initialized = false;
  public closed = false;

  @Collection.Create()
  create() {
    return new CustomerNotes();
  }

  @Collection.Get()
  read() {
    return new CustomerNotes();
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
    return new CustomerNotes();
  }

  @Collection.UpdateMany()
  updateMany() {
    return 1;
  }

  @Collection.FindMany({
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
