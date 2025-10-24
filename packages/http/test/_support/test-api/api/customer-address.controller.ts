import { HttpController, HttpOperation } from '@opra/common';
import { HttpContext } from '@opra/http';
import { Address } from 'example-customer-mongo/models';
import { Data } from '../../../../../../examples/_lib/data/customers-data.js';

@(HttpController({
  description: 'Customer addresses resource',
  path: 'Addresses@:addressId',
}).PathParam('addressId', Number))
export class CustomerAddressController {
  @HttpOperation.Entity.Get(Address)
  async get(context: HttpContext) {
    const subData = Data.addresses[context.pathParams.customerId];
    if (!subData) return;
    return subData.find(x => x._id === context.pathParams.addressId);
  }
}
