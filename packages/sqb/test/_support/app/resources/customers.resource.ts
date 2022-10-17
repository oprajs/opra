import { CollectionResourceController, IEntityService } from '@opra/core';
import { OprCollectionResource, OprSearchResolver } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
import { Customer } from '../entities/customer.entity.js';
import { CustomerService } from '../services/customer.service.js';

@OprCollectionResource(Customer)
export class CustomersResource extends CollectionResourceController<Customer> {
  readonly customersService: CustomerService;

  constructor(readonly db: SqbClient) {
    super();
    this.customersService = new CustomerService(db);
  }

  @OprSearchResolver({
    sortFields: ['id', 'givenName', 'familyName', 'gender']
  })
  search;

  getService(): IEntityService {
    return this.customersService;
  }

}
