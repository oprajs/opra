import { HttpController, HttpOperation } from '@opra/common';
import { Customer } from 'customer-mongo/models';

@HttpController({
  description: 'Customer resource',
  path: 'Customers@:customerId',
}).PathParam('customerId', 'uuid')
export class CustomerController {
  @HttpOperation.Entity.Get({ type: Customer })
  get() {
    //
  }

  @HttpOperation.Entity.Delete({ type: Customer })
  delete() {
    //
  }
}
