import { Customer } from '@opra/common/test/_support/test-api';
import { MongoCollectionService } from '@opra/mongodb';

export class CustomersService extends MongoCollectionService<Customer> {
  constructor(options?: MongoCollectionService.Options) {
    super(Customer, {
      collectionName: 'Customers',
      ...options,
    });
  }
}
