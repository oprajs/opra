import { HttpOperation, HttpResource } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@HttpResource({
  description: 'Customers collection'
})
export class CustomersController {

  @HttpOperation.Entity.FindMany(Customer)
      .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.city')
      .Filter('givenName', ['=', '!=', 'like', '!like'])
  findMany() {
    //
  }

  @HttpOperation.Entity.Create(Customer)
  create() {
    //
  }

  @HttpOperation.Entity.Delete(Customer, 'id')
  delete() {
    //
  }

}
