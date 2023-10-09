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

  @Collection.FindMany({
    sortFields: ['_id', 'givenName', 'familyName', 'gender', 'address.countryCode'],
    defaultSort: ['givenName'],
    filters: [
      {field: '_id', operators: ['=', '>', '<', '>=', '<=']},
      {field: 'givenName', operators: ['=', '!=', 'like', '!like', 'ilike', '!ilike']},
      {field: 'familyName', operators: ['=', '!=', 'like', '!like']},
      {field: 'gender', operators: ['=']},
      {field: 'uid', operators: ['=']},
      {field: 'address.countryCode', operators: ['=']},
      {field: 'deleted', operators: ['=']},
      {field: 'active', operators: ['=']},
      {field: 'birthDate', operators: ['=']},
      {field: 'rate', operators: ['=', '>', '<', '>=', '<=', 'in', '!in']},
    ]
  })
  findMany;

  getService(ctx: RequestContext) {
    return this.service.forContext(ctx);
  }

}
