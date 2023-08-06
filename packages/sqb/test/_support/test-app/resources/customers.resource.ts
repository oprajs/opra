import { Collection } from '@opra/common';
import { OperationContext } from '@opra/core';
import { SqbCollectionResource, SqbEntityService } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Customer } from '../entities/customer.entity.js';

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
  findMany;

  getService(ctx: OperationContext) {
    return this.service.with(ctx);
  }

}
