import {
  HttpController,
  HttpOperation,
  NotFoundError,
  OperationResult,
} from '@opra/common';
import { HttpContext } from '@opra/http';
import { Address } from 'example-customer-mongo/models';
import { Data } from '../../../../../../examples/_lib/data/customers-data.js';

@HttpController({
  description: 'Customer addresses',
  path: 'Addresses',
})
export class CustomerAddressesController {
  @HttpOperation.Entity.Create(Address)
  async create(context: HttpContext) {
    const subData = Data.addresses[context.pathParams.customerId];
    if (!subData) throw new NotFoundError();
    const body = await context.getBody<Address>();
    const address: Address = { ...body, _id: ++Data.idGen };
    subData.push(address);
    return address;
  }

  @(HttpOperation.Entity.FindMany(Address)
    .Filter('_id', ['=', '>', '<', '>=', '<='])
    .Filter('city', ['=', 'like', '!like'])
    .Filter('countryCode', ['=']))
  async findMany(context: HttpContext) {
    const subData = Data.addresses[context.pathParams.customerId];
    if (!subData) return;
    const { queryParams } = context;
    const skip = queryParams.skip || 0;
    const limit = queryParams.limit || 10;
    return new OperationResult({
      totalMatches: subData.length,
      payload: subData.slice(skip, skip + limit),
    });
  }
}
