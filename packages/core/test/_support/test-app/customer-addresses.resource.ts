import { Api, ExecutionContext } from '../../../src';
import { Address } from '../dto/address.dto';

@Api.EntityResource(Address, {
  primaryKey: 'id',
  description: 'Customer address resource',
})
export class CustomerAddressesResource {

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
