import { ComplexField, ComplexType, UnionType } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Country } from './country.entity.js';
import { CustomerNote } from './customer-note.entity.js';
import { Record } from './record.entity.js';

@ComplexType()
@Entity('customers')
export class Customer extends UnionType(Record, Person) {

  @ComplexField()
  @Column({dataType: DataType.GUID})
  cid: string;

  @ComplexField()
  @Column()
  identity: string;

  @ComplexField()
  @Column({default: true})
  active: boolean;

  @ComplexField()
  @Column({default: false})
  vip: boolean;

  @ComplexField()
  @Column()
  countryCode: string;

  @ComplexField()
  @Column()
  city?: string;

  @ComplexField()
  @Column({exclusive: true})
  address?: Address;

  @ComplexField()
  @Link().toOne(Country)
  country: Country;

  @ComplexField()
  @Link({exclusive: true}).toMany(CustomerNote, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNote[];

}
