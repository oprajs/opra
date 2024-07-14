import { HttpController, HttpOperation, OmitType, OperationResult } from '@opra/common';
import { SQBAdapter } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Customer, CustomersService } from 'customer-sqb';
import { PartialDTO } from 'ts-gems';

@HttpController({
  path: 'Customers',
})
export class CustomersController {
  service: CustomersService;

  constructor(readonly db: SqbClient) {
    this.service = new CustomersService({ db });
  }

  @HttpOperation.Entity.Create(Customer, {
    requestBody: {
      type: OmitType(Customer, ['_id']),
    },
  })
  async create(context: HttpOperation.Context): Promise<PartialDTO<Customer>> {
    const { data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).create(data, options);
  }

  @(HttpOperation.Entity.FindMany(Customer)
    .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.countryCode')
    .DefaultSort('givenName')
    .Filter('_id')
    .Filter('givenName')
    .Filter('familyName')
    .Filter('gender')
    .Filter('uid')
    .Filter('address.countryCode')
    .Filter('deleted')
    .Filter('active')
    .Filter('birthDate')
    .Filter('rate'))
  async findMany(context: HttpOperation.Context) {
    const { options } = await SQBAdapter.parseRequest(context);
    if (options.count) {
      const { items, count } = await this.service.for(context).findManyWithCount(options);
      return new OperationResult({
        payload: items,
        totalMatches: count,
      });
    }
    return this.service.for(context).findMany(options);
  }

  @(HttpOperation.Entity.DeleteMany(Customer).Filter('_id'))
  async deleteMany(context: HttpOperation.Context) {
    const { options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).deleteMany(options);
  }

  @(HttpOperation.Entity.UpdateMany(Customer).Filter('_id'))
  async updateMany(context: HttpOperation.Context) {
    const { data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).updateMany(data, options);
  }
}
