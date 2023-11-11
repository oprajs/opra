import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Record } from '../types/record.type.js';

@ComplexType({
  description: 'Profile information'
})
@Entity('my_profile')
export class Profile extends MixinType(Record, Person) {

  @ApiField()
  @Column({type: Address, exclusive: true})
  address?: Address;
}
