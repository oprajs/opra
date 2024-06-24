import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Address } from './address.js';
import { Person } from './person.js';
import { Record } from './record.js';

@ComplexType({
  description: 'Profile information',
})
export class Profile extends MixinType(Record, Person) {
  @ApiField()
  address?: Address;
}
