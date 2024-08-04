import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Address } from './address.js';
import { Person } from './person.js';
import { Record } from './record.js';

@ComplexType({
  description: 'Profile information',
})
@Entity('my_profile')
export class Profile extends MixinType(Record, Person) {
  @ApiField()
  @Column({ type: Address, exclusive: true })
  declare address?: Address;
}
