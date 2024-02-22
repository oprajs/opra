import { ApiOperation, ApiResource } from '@opra/common';
import { Customer } from '../entities/customer.entity.js';

@ApiResource({
  description: 'Customers collection'
})
export class CustomersCollection {

  @ApiOperation.Entity.FindMany(Customer)
      .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.city')
      .Filter('givenName', ['=', '!=', 'like', '!like'])
  findMany() {
    //
  }

  @ApiOperation.Entity.Create(Customer)
  create() {
    //
  }

  @ApiOperation.Entity.Delete(Customer)
  deleteMany() {
    //
  }

}
