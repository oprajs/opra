import { MixinType, OprEntity } from '@opra/schema';
import { Address } from '../types/address.type.js';
import { Record } from './record.entity.js';

@OprEntity({
  description: 'Address information'
})
export class CustomerAddress extends MixinType(Record, Address) {

}
