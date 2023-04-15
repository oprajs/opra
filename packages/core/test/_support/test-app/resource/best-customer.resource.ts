import {
  Singleton,
} from '@opra/common';
import { Customer } from '../../../../../common/test/_support/test-doc/index.js';

@Singleton(Customer, {
  description: 'Best Customer resource'
})
export class BestCustomerResource {

  @Singleton.CreateOperation()
  create() {
    //
  }

  @Singleton.DeleteOperation()
  delete() {
    //
  }

  @Singleton.GetOperation()
  raed() {
    //
  }

  @Singleton.UpdateOperation()
  update() {
    //
  }

}
