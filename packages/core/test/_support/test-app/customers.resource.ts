import { Api, ExecutionContext, JsonDataService } from '../../../src';
import { Customer } from '../dto/customer.dto';
import customersData from '../data/customers.data';

@Api.EntityResource(Customer, {
  primaryKey: 'id',
  description: 'Customer resource',
})
export class CustomersResource {

  customersService = new JsonDataService({
    data: customersData,
    primaryKey: 'id'
  });

  constructor() {
    //
  }

  @Api.ReadOperation()
  read(ctx: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }

  @Api.SearchOperation()
  search(ctx: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }
}
