import {
  ApiEntityResource, ExecutionContext
} from '../../../../src/index.js';
import { Address } from '../dto/address.dto.js';

@ApiEntityResource(Address, {
  description: 'Customer address resource',
})
export class CustomerAddressesesResource {

  get(ctx: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }

  search(ctx: ExecutionContext) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }
}
