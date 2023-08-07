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
    sortFields: ['_id', 'givenName', 'familyName', 'gender', 'address.countryCode'],
    defaultSort: ['givenName'],
    filters: [
      {field: '_id', operators: ['=', '>', '<', '>=', '<=']},
      {field: 'givenName', operators: ['=', '!=', 'like', '!like', 'ilike', '!ilike']},
      {field: 'familyName', operators: ['=', '!=', 'like', '!like']},
      {field: 'gender', operators: ['=']},
      {field: 'uid', operators: ['=']},
      {field: 'address.countryCode', operators: ['=']},
      {field: 'deleted', operators: ['=', '!=']},
      {field: 'active', operators: ['=', '!=']},
      {field: 'birthDate', operators: ['=']},
      {field: 'rate', operators: ['=', '>', '<', '>=', '<=', 'in', '!in']},
    ]
  })
  findMany;

  getService(ctx: OperationContext) {
    return this.service.with(ctx);
  }

}
