import '@opra/sqb';
import { ComplexField, ComplexType, UnionType } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { ContactPerson } from '../types/contact-person.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer information',
})
@Entity()
export class Customer extends UnionType(Record, Person) {

  @ComplexField()
  @Column({dataType: DataType.GUID, notNull: true})
  cid: string;

  @ComplexField({required: false})
  @Column({notNull: true})
  identity: string;

  @ComplexField()
  @Column()
  city: string;

  @ComplexField()
  @Column()
  countryCode: string;

  @ComplexField()
  @Column({default: true})
  active: boolean;

  @ComplexField({type: 'integer'})
  @Column({exclusive: true})
  vip: number;

  @ComplexField()
  @Column({type: Address})
  address?: Address;

  @ComplexField()
  @Column({type: ContactPerson, dataType: DataType.JSON, isArray: true})
  contactPersons: ContactPerson[]

  @ComplexField()
  @Link({exclusive: true}).toMany(CustomerNotes, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNotes[];

  @ComplexField()
  @Column({dataType: DataType.INTEGER})
  fieldInteger: number;

  @ComplexField()
  @Column({dataType: DataType.BIGINT})
  fieldBigint: bigint;

  @ComplexField()
  @Column({dataType: DataType.GUID})
  fieldGuid: string;

}
