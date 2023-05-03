import { Db } from 'mongodb';
import { Collection } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core/src/index';
import { MongoCollectionResource, MongoEntityService } from '../../../src/index.js';

@Collection(Customer, {
  primaryKey: '_id'
})
export class CustomersResource extends MongoCollectionResource<Customer> {
  service: MongoEntityService<Customer>;

  constructor(readonly db: Db) {
    super();
    this.service = new MongoEntityService('Customers', {db});
  }

  @Collection.FindMany({
    sortFields: ['_id', 'givenName', 'familyName', 'gender']
  })
  search;

  getService(ctx: RequestContext) {
    return this.service.with(ctx);
  }

}
