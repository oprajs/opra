import { Collection } from '@opra/common';
import { EndpointContext } from '@opra/core';
import { SqbCollection, SqbEntityService } from '@opra/sqb';
import { Customer } from '../entities/customer.entity.js';
import { CustomerService } from '../services/customer.service.js';

@Collection(Customer, {
  description: 'Customer resource'
})
export class CustomersResource extends SqbCollection<Customer> {

  constructor(public customerService: CustomerService) {
    super();
  }

  @Collection.FindMany()
      .SortFields('id', 'givenName', 'familyName', 'gender', 'birthDate')
      .Filter('id', '=')
      .Filter('givenName', ['=', 'like', 'ilike'])
      .Filter('familyName', ['=', 'like', 'ilike'])
      .Filter('gender', ['=', '!=', 'in'])
      .Filter('birthDate', ['=', '>', '>=', '<', '<='])
  findMany;

  @Collection.Create({
    inputMaxContentSize: '200kb'
  })
  create;

  @Collection.Action()
  async sendMessage(context: Collection.Action.Context) {
    if (context.key)
      return {sent: 1}
    return {sent: 20};
  }

  getService(ctx: EndpointContext): SqbEntityService<Customer> {
    return this.customerService.with(ctx);
  }

}
