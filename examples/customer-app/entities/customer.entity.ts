import '@opra/sqb';
import { ApiField, ComplexType, UnionType } from '@opra/common';
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

  @ApiField()
  @Column({dataType: DataType.GUID, notNull: true})
  cid: string;

  @ApiField({required: false})
  @Column({notNull: true})
  identity: string;

  @ApiField()
  @Column()
  city?: string;

  @ApiField()
  @Column()
  countryCode?: string;

  @ApiField()
  @Column({default: true})
  active: boolean;

  @ApiField({type: 'integer'})
  @Column({exclusive: true})
  vip?: number;

  @ApiField()
  @Column({type: Address})
  address?: Address;

  @ApiField()
  @Column({type: ContactPerson, dataType: DataType.JSON, isArray: true})
  contactPersons?: ContactPerson[]

  @ApiField()
  @Link({exclusive: true}).toMany(CustomerNotes, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNotes[];

  @ApiField()
  @Column({dataType: DataType.INTEGER})
  fieldInteger?: number;

  @ApiField()
  @Column({dataType: DataType.BIGINT})
  fieldBigint?: bigint;

  @ApiField()
  @Column({dataType: DataType.GUID})
  fieldGuid?: string;

}
