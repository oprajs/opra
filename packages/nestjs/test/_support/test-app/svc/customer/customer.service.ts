import filedirname from 'filedirname'
import { readFileSync } from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { JsonDataService } from '@opra/core';
import { Customer } from './customer.dto';

const data: any[] = JSON.parse(readFileSync(path.join(filedirname()[1], './customers.json'), 'utf-8'));

@Injectable()
export class CustomerService extends JsonDataService<Customer> {

  constructor() {
    super(Customer, data);
  }

}
