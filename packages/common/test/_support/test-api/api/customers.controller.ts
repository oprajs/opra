import { HttpController, HttpOperation } from '@opra/common';
import { Customer } from 'customer-mongo/models';

@HttpController({
  description: 'Customers collection',
})
export class CustomersController {
  @(HttpOperation.Entity.FindMany({ type: Customer })
    .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.city')
    .Filter('givenName', ['=', '!=', 'like', '!like']))
  findMany() {
    //
  }

  @HttpOperation.Entity.Create({ type: Customer })
  create() {
    //
  }
}
