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

  @Collection.FindMany({
    sortFields: ['id', 'givenName', 'familyName', 'gender', 'birthDate'],
    filters: [
      {field: 'id', operators: ['=']},
      {field: 'givenName', operators: ['=', 'like', 'ilike']},
      {field: 'familyName', operators: ['=', 'like', 'ilike']},
      {field: 'gender', operators: ['=', 'in']},
      {field: 'birthDate', operators: ['=', '>', '>=', '<', '<=']}
    ],
    response: {}
  })
  findMany;

  @Collection.Create({
    input: {
      maxContentSize: '200kb'
    }
  })
  create;

  getService(ctx: EndpointContext): SqbEntityService<Customer> {
    return this.customerService.with(ctx);
  }

}
