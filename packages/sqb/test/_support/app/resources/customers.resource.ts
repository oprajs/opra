import { EntityResourceController, IEntityService } from '@opra/core';
import { OprEntityResource, OprSearchResolver } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
import { Customer } from '../entities/customer.entity.js';
import { CustomerService } from '../services/customer.service.js';

@OprEntityResource(Customer)
export class CustomersResource extends EntityResourceController<Customer> {
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
