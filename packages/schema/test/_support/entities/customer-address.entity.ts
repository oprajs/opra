import { MixinType, OprComplexType } from '../../../src/index.js';
import { Address } from '../types/address.dto.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Address information'
})
export class CustomerAddress extends MixinType(Record, Address) {

}
