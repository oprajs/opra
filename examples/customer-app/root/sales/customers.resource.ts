import { Collection } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SqbCollection, SqbEntityService } from '@opra/sqb';
import { Customer } from '../../types/entities/customer.entity.js';
import { CustomerService } from './customer.service.js';

@Collection(Customer, {
  description: 'Customer resource'
})
export class CustomersResource extends SqbCollection<Customer> {
  public customerService = new CustomerService();

  @Collection.FindMany()
      .SortFields('id', 'givenName', 'familyName', 'gender', 'birthDate')
      .Filter('id', '=')
      .Filter('givenName', ['=', 'like', 'ilike'])
      .Filter('familyName', ['=', 'like', 'ilike'])
      .Filter('gender', ['=', '!=', 'in'])
      .Filter('birthDate', ['=', '>', '>=', '<', '<='])
  findMany;

  @Collection.Create()
      .InputOverwriteFields({
        createdBy: {required: true}
      })
  async create(ctx: Collection.Create.Context) {
    const {request} = ctx;
    if (request.data.createdBy)
      request.data.createdBy = {givenName: 'x', familyName: 'y'};
    return super.create!(ctx);
  }

  @Collection.Action()
      .Parameter('ids', {type: String, isArray: true, required: true})
      .Parameter('message', {type: String, required: true})
  async sendMessage(context: Collection.Action.Context) {
    const {params} = context.request;
    return {sent: params.ids.length, ids: params.ids, message: params.message};
  }

  getService(ctx: RequestContext): SqbEntityService<Customer> {
    return this.customerService.forContext(ctx);
  }

}
