import { Injectable } from '@nestjs/common';
import { SqbEntityService } from '@opra/sqb';
import { app } from '../../app.js';
import { Customer } from '../../types/entities/customer.entity.js';

@Injectable()
export class CustomerService extends SqbEntityService<Customer> {

  constructor() {
    super(Customer, {db: app.db})
  }

}
