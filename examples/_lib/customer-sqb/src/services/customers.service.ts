import assert from 'node:assert';
import { SqbCollectionService, SqbEntityService } from '@opra/sqb';
import { Customer } from '../models/index.js';

export class CustomersService extends SqbCollectionService<Customer> {
  static idGen = 5000;

  constructor(options?: SqbCollectionService.Options) {
    super(Customer, {
      ...options,
      interceptor: async (callback: () => any, info: SqbEntityService.CommandInfo) => {
        if (info.crud === 'create') info.input!._id = ++CustomersService.idGen;
        return callback();
      },
    });
    assert.ok(options?.db, 'You must provide "db" argument');
  }
}
