import { Injectable } from '@nestjs/common';
import { SqbClient } from '@sqb/connect';
import { BaseEntityService } from '../../../../src/index.js';
import { Customer } from '../entities/customer.entity.js';

@Injectable()
export class CustomerService extends BaseEntityService<Customer> {

  constructor(readonly db: SqbClient) {
    super(Customer);
  }

  protected getConnection() {
    return this.db;
  }

}
