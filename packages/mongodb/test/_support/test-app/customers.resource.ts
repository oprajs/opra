import { Db } from 'mongodb';
import { Collection } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core';
import { MongoCollection, MongoEntityService } from '../../../src/index.js';

@Collection(Customer, {
  primaryKey: '_id'
})
export class CustomersResource extends MongoCollection<Customer> {
  service: MongoEntityService<Customer>;

  constructor(readonly db: Db) {
    super();
    this.service = new MongoEntityService('Customers', {db});
  }

  @Collection.FindMany()
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
      .Filter('rate')
  findMany;

  getService(ctx: RequestContext) {
    return this.service.forContext(ctx);
  }

}
