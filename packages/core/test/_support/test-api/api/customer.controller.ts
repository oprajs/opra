import merge from 'putil-merge';
import { HttpController, HttpOperation } from '@opra/common';
import { Customer, Data } from '../../../../../common/test/_support/test-api/index.js';
import { CustomerAddressController } from './customer-address.controller.js';
import { CustomerAddressesController } from './customer-addresses.controller.js';

@HttpController({
  description: 'Customer resource',
  path: 'Customers@:customerId',
  controllers: [CustomerAddressesController, CustomerAddressController],
})
  .PathParam('customerId', Number)
  .Cookie('accessToken', String)
  .Header('accessToken', String)
export class CustomerController {
  initialized = false;
  closed = false;

  @HttpOperation.Entity.Get(Customer)
    .QueryParam(/^a\d+$/, Number)
    .QueryParam(/^b\d+$/, { type: Number, isArray: true, arraySeparator: ',' })
    .Header('access-key', { type: Number, isArray: true, arraySeparator: ',' })
    .Cookie('cid', 'integer')
    .Header('cid', 'integer')
  async get(context: HttpOperation.Context) {
    return Data.customers.find(x => x._id === context.pathParams.customerId);
  }

  @HttpOperation.Entity.Delete(Customer)
  async delete(context: HttpOperation.Context) {
    const oldLen = Data.customers.length;
    Data.customers = Data.customers.filter(x => x._id !== context.pathParams.customerId);
    return oldLen - Data.customers.length;
  }

  @HttpOperation.Entity.Update(Customer)
  async update(context: HttpOperation.Context) {
    const customer = Data.customers.find(x => x._id === context.pathParams.customerId);
    if (customer) {
      const body = await context.getBody<Customer>();
      merge(customer, body);
    }
    return customer;
  }

  @HttpOperation({ path: 'sendMessage' }).QueryParam('message', String)
  async sendMessage(context: HttpOperation.Context) {
    return { sent: 1, message: context.queryParams.message };
  }

  @HttpController.OnInit()
  async onInit() {
    this.initialized = true;
  }

  @HttpController.OnShutdown()
  async onShutdown() {
    this.closed = true;
  }
}