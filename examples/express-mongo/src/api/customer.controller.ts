import { HttpController, HttpOperation } from '@opra/common';
import { HttpContext } from '@opra/http';
import { MongoAdapter } from '@opra/mongodb';
import { Customer, CustomersService } from 'customer-mongo';
import { Db } from 'mongodb';
import { type PartialDTO } from 'ts-gems';
import { CustomerNotesController } from './customer-notes.controller.js';

@(HttpController({
  path: 'Customers',
  controllers: [
    (parent: CustomerController) => new CustomerNotesController(parent.db),
  ],
}).KeyParam('customerId', 'number'))
export class CustomerController {
  service: CustomersService;

  constructor(readonly db: Db) {
    this.service = new CustomersService({ db });
  }

  @(HttpOperation.Entity.Get(Customer).QueryParam('xId'))
  async get(context: HttpContext): Promise<PartialDTO<Customer> | undefined> {
    const { key, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).findById(key, options);
  }

  @HttpOperation.Entity.Delete(Customer)
  async delete(context: HttpContext) {
    const { key, options } = await MongoAdapter.parseRequest(context);
    return await this.service.for(context).delete(key, options);
  }

  @HttpOperation.Entity.Update(Customer)
  async update(context: HttpContext) {
    const { key, data, options } = await MongoAdapter.parseRequest(context);
    return this.service.for(context).update(key, data, options);
  }
}
