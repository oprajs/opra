import { Collection } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: 'id'
})
export class CustomersResource {

  @Collection.SearchOperation({
    sortElements: ['id', 'givenName', 'familyName', 'gender', 'address.city']
  })
  search() {
    //
  }

}
