import { Collection } from '@opra/common';
import { SqbClient } from '@sqb/connect';
import { SqbCollectionResource, SqbEntityService } from '../../../../src/index.js';
import { Customer } from '../entities/customer.entity.js';
import { CustomerService } from '../services/customer.service.js';

@Collection(Customer)
export class CustomersResource extends SqbCollectionResource<Customer> {
  readonly customersService: CustomerService;

  constructor(readonly db: SqbClient) {
    super();
    this.customersService = new CustomerService(db);
  }

  @Collection.SearchOperation({
    sortElements: ['id', 'givenName', 'familyName', 'gender']
  })
  search;

  getService(): SqbEntityService<Customer> {
    return this.customersService;
  }

}
