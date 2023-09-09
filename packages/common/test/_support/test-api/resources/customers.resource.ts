import { Collection } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: '_id'
})
export class CustomersResource {

  @Collection.FindMany()
      .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.city')
  findMany() {
    //
  }

}
