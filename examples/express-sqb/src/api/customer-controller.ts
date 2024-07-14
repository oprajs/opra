import { HttpController, HttpOperation } from '@opra/common';
import { SQBAdapter } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Customer, CustomersService } from 'customer-sqb';
import { PartialDTO } from 'ts-gems';

@(HttpController({
  path: 'Customers',
  controllers: [],
}).KeyParam('customerId', Number))
export class CustomerController {
  service: CustomersService;

  constructor(readonly db: SqbClient) {
    this.service = new CustomersService({ db });
  }

  @HttpOperation.Entity.Get(Customer)
  async get(context: HttpOperation.Context): Promise<PartialDTO<Customer> | undefined> {
    const { key, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).findById(key, options);
  }

  @HttpOperation.Entity.Delete(Customer)
  async delete(context: HttpOperation.Context) {
    const { key, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).delete(key, options);
  }

  @HttpOperation.Entity.Update(Customer)
  async update(context: HttpOperation.Context) {
    const { key, data, options } = await SQBAdapter.parseRequest(context);
    return this.service.for(context).update(key, data, options);
  }
}
