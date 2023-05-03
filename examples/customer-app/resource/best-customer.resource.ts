import {
  Singleton,
} from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@Singleton(Customer, {
  description: 'Best Customer resource'
})
export class BestCustomerResource {

  @Singleton.Get()
  raed() {
    return new Customer();
  }

}
