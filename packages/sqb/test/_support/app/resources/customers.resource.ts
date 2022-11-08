import { OprCollectionResource, OprSearchResolver } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
import { BaseEntityResource, BaseEntityService } from '../../../../src/index.js';
import { Customer } from '../entities/customer.entity.js';
import { CustomerService } from '../services/customer.service.js';

@OprCollectionResource(Customer)
export class CustomersResource extends BaseEntityResource<Customer> {
  readonly customersService: CustomerService;

  constructor(readonly db: SqbClient) {
    super();
    this.customersService = new CustomerService(db);
  }

  @OprSearchResolver({
    sortFields: ['id', 'givenName', 'familyName', 'gender']
  })
  search;

  getService(): BaseEntityService<Customer> {
    return this.customersService;
  }

}
