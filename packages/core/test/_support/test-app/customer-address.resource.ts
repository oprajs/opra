import { EntityResource, ReadHandler } from '../../../src/decorators/resource.decorator';
import { Address } from '../dto/address.dto';

@EntityResource(Address, {key: 'id'})
export class CustomerAddressResource {

  @ReadHandler()
  read(ctx) {
    // eslint-disable-next-line no-console
    console.log(ctx);
  }
}
