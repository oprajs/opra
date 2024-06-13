import { SqbCollectionService } from '@opra/sqb';
import { Customer } from '../entities/customer.entity.js';

export class CustomersService extends SqbCollectionService<Customer> {
  constructor(options?: SqbCollectionService.Options) {
    super(Customer, options);
  }
}
