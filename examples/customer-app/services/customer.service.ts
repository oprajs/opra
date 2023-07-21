import { Injectable } from '@nestjs/common';
import { SqbEntityService } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Customer } from '../entities/customer.entity.js';

@Injectable()
export class CustomerService extends SqbEntityService<Customer> {

  constructor(db: SqbClient) {
    super(Customer, {db})
  }

}
