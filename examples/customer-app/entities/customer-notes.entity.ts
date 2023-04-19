import '@opra/sqb';
import { ApiField, ComplexType, OmitType, UnionType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Person } from '../types/person.type.js';
import { PhoneNumber } from '../types/phone.type.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer notes entity',
})
@Entity()
export class CustomerNotes extends Record {

  @ApiField()
  @Column({notNull: true})
  customerId: number;

  @ApiField()
  @Column({notNull: true})
  title: string;

  @ApiField()
  @Column()
  text: string;

  @ApiField({
    type: UnionType(OmitType(Person, ['birthDate']), PhoneNumber)
  })
  @Column()
  filler: Omit<Person, 'birthDate'> & PhoneNumber;

}
