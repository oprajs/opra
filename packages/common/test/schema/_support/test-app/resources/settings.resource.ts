import {
  OprCreateResolver, OprGetResolver,
  OprSingletonResource
} from '../../../../../src/index.js';
import { Customer } from '../entities/customer.entity.js';

@OprSingletonResource(Customer, {
  description: 'Settings resource'
})
export class BestCustomerResource {

  @OprCreateResolver()
  create() {
    //
  }

  @OprGetResolver()
  get() {
    //
  }

}
