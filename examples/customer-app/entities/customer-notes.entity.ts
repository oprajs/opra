import '@opra/sqb';
import { ComplexType, Expose, OmitType, UnionType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';
import { Person } from '../types/person.type.js';
import { PhoneNumber } from '../types/phone.type.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer notes entity',
})
@Entity()
export class CustomerNotes extends Record {

  @Expose()
  @Column({notNull: true})
  customerId: number;

  @Expose()
  @Column({notNull: true})
  title: string;

  @Expose()
  @Column()
  text: string;

  @Expose({
    type: UnionType(OmitType(Person, ['birthDate']), PhoneNumber)
  })
  @Column()
  filler: Omit<Person, 'birthDate'> & PhoneNumber;

}
