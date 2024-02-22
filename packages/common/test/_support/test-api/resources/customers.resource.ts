import { ApiOperation, ApiResource } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@ApiResource({
  description: 'Customer resource',
}).KeyParameter('_id')
export class CustomersResource {

  @ApiOperation.Entity.FindOne(Customer)
  get() {
    //
  }

}
