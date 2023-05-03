import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Record } from '../types/record.type.js';

@ComplexType({
  description: 'Profile information'
})
@Entity('my_profile')
export class Profile extends UnionType(Record, Person) {

  @ApiField({type: Address, exclusive: true})
  @Column({exclusive: true})
  address?: Address;
}
