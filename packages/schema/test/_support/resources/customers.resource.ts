import { OprEntityResource, OprSearchResolver } from '../../../src/index.js';
import { Customer } from '../entities/customer.entity.js';

@OprEntityResource(Customer, {
  description: 'Customer resource',
  keyFields: 'id'
})
export class CustomersResource {

  @OprSearchResolver({
    sortFields: ['id', 'givenName', 'familyName', 'gender', 'address.city']
  })
  search() {
    //
  }

}
