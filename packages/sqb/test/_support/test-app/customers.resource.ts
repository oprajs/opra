import { Collection } from '@opra/common';
import { Customer } from '@opra/common/test/_support/test-api';
import { RequestContext } from '@opra/core';
import { SqbClient } from '@sqb/connect';
import { SqbCollectionResource, SqbEntityService } from '../../../src/index.js';

@Collection(Customer, {
  primaryKey: '_id'
})
export class CustomersResource extends SqbCollectionResource<Customer> {
  service: SqbEntityService<Customer>;

  constructor(readonly db: SqbClient) {
    super();
    this.service = new SqbEntityService(Customer, {db});
  }

  @Collection.FindMany({
    sortFields: ['_id', 'givenName', 'familyName', 'gender']
  })
  search;

  getService(ctx: RequestContext) {
    return this.service.with(ctx);
  }

}
