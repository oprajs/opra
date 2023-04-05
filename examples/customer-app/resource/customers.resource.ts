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

  @Collection.CreateOperation()
  create() {
    return new CustomerNotes();
  }

  @Collection.GetOperation()
  read() {
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
    sortElements: ['id', 'givenName', 'familyName', 'gender', 'birthDate', 'address.city'],
    defaultSort: ['givenName'],
    filters: [
      {element: 'id', operators: ['=']},
      {element: 'countryCode', operators: ['=', 'in', '!in']},
      {element: 'city', operators: ['=', 'like', '!like']},
      {element: 'vip'},
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
