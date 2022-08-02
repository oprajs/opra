import { Api } from '../../../src';
import { Address } from '../dto/address.dto';

@Api.Entity(Address, {
  primaryKey: 'id',
  description: 'Customer address resource'
})
export class CustomerAddressResource {

  @Api.ReadHandler()
  read() {
    // eslint-disable-next-line no-console
  }
}
