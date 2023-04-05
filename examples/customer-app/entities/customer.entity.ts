import '@opra/sqb';
import { ComplexType, Expose, UnionType } from '@opra/common';
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

  @Expose()
  @Column({dataType: DataType.GUID, notNull: true})
  cid: string;

  @Expose({required: false})
  @Column({notNull: true})
  identity: string;

  @Expose()
  @Column()
  city: string;

  @Expose()
  @Column()
  countryCode: string;

  @Expose()
  @Column({default: true})
  active: boolean;

  @Expose({type: 'integer'})
  @Column({exclusive: true})
  vip: number;

  @Expose()
  @Column({type: Address})
  address?: Address;

  @Expose()
  @Column({type: ContactPerson, dataType: DataType.JSON, isArray: true})
  contactPersons: ContactPerson[]

  @Expose()
  @Link({exclusive: true}).toMany(CustomerNotes, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNotes[];

  @Expose()
  @Column({dataType: DataType.INTEGER})
  fieldInteger: number;

  @Expose()
  @Column({dataType: DataType.BIGINT})
  fieldBigint: bigint;

  @Expose()
  @Column({dataType: DataType.GUID})
  fieldGuid: string;

}
