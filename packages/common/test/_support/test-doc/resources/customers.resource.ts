import { Collection } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@Collection(Customer, {
  description: 'Customer resource',
  primaryKey: 'id'
})
export class CustomersResource {

  @Collection.SearchOperation({
    sortFields: ['id', 'givenName', 'familyName', 'gender', 'address.city']
  })
  search() {
    //
  }

}
