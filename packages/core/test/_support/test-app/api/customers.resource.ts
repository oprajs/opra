import {
  ApiEntityResource,
  ExecutionContext
} from '../../../../src/index.js';
import { Customer } from '../dto/customer.dto.js';

@ApiEntityResource(Customer, {
  description: 'Customer resource',
})
export class CustomersResource {
  /*
    customersService = new JsonDataService({
      data: customersData,
      primaryKey: 'id'
    });*/

  constructor() {
    //
  }

  get(ctx: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }

  search(ctx: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }
}
