import { HttpController, HttpOperation } from '@opra/common';
import { Address } from 'customer-mongo/models';
import { Data } from '../../../../../../examples/_lib/data/customers-data.js';

@(HttpController({
  description: 'Customer addresses resource',
  path: 'Addresses@:addressId',
}).PathParam('addressId', Number))
export class CustomerAddressController {
  @HttpOperation.Entity.Get(Address)
  async get(context: HttpOperation.Context) {
    const subData = Data.addresses[context.pathParams.customerId];
    if (!subData) return;
    return subData.find(x => x._id === context.pathParams.addressId);
  }
}
