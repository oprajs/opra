import { Collection } from '@opra/common';
import { HttpContext } from '@opra/core';
import { SqbCollection, SqbEntityService } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Customer } from '../entities/customer.entity.js';

@Collection(Customer, {
  primaryKey: '_id'
})
export class CustomersResource extends SqbCollection<Customer> {
  service: SqbEntityService<Customer>;

  constructor(readonly db: SqbClient) {
    super();
    this.service = new SqbEntityService(Customer, {db});
  }

  @Collection.Create()
  create;

  @Collection.Delete()
  delete;

  @Collection.DeleteMany()
  deleteMany;

  @Collection.Get()
  get;

  @Collection.Update()
      .InputOmitFields('_id')
  update;

  @Collection.UpdateMany()
      .InputOmitFields('_id')
  updateMany;

  @Collection.FindMany()
      .SortFields('_id', 'givenName', 'familyName', 'gender', 'address.countryCode')
      .DefaultSort('givenName')
      .Filter('_id', ['=', '>', '<', '>=', '<='])
      .Filter('givenName', ['=', '!=', 'like', '!like', 'ilike', '!ilike'])
      .Filter('familyName', ['=', '!=', 'like', '!like'])
      .Filter('gender', ['='])
      .Filter('uid', ['='])
      .Filter('address.countryCode', ['='])
      .Filter('deleted', ['=', '!='])
      .Filter('active', ['=', '!='])
      .Filter('birthDate', ['='])
      .Filter('rate', ['=', '>', '<', '>=', '<=', 'in', '!in'])
  findMany;

  getService(ctx: HttpContext) {
    return this.service.for(ctx);
  }

}
