import {
  ApiEntityResource, QueryContext
} from '../../../../src/index.js';
import { Address } from '../dto/address.dto.js';

@ApiEntityResource(Address, {
  description: 'Customer address resource',
})
export class CustomerAddressesesResource {

  get(ctx: QueryContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }

  search(ctx: QueryContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }
}
