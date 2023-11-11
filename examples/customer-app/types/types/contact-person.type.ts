import { ApiField, ComplexType, OmitType, MixinType } from '@opra/common';
import { Column } from '@sqb/connect';
import { Person } from './person.type.js';
import { PhoneNumber } from './phone.type.js';

@ComplexType({
  description: 'Person information'
})
export class ContactPerson extends UnionType(OmitType(Person, ['gender', 'birthDate']), PhoneNumber) {

  @ApiField()
  @Column({fieldName: 'relation_ship', notNull: true})
  relationShip: string;

}
