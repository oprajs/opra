import { OprEntityResource } from '../../../src/index.js';
import { CustomerAddress } from '../entities/customer-address.entity.js';

@OprEntityResource(CustomerAddress, {
  description: 'Customer address resource',
})
export class CustomerAddressesResource {

  get() {
    //
  }

  search() {
    //
  }
}
