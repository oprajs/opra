import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Record } from '../types/record.type.js';

@ComplexType({
  description: 'Profile information'
})
export class Profile extends UnionType(Record, Person) {

  @ApiField({type: Address, exclusive: true})
  address?: Address;
}