import { ComplexType, Expose, UnionType } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Country } from './country.entity.js';
import { CustomerNote } from './customer-note.entity.js';
import { Record } from './record.entity.js';

@ComplexType()
@Entity('customers')
export class Customer extends UnionType(Record, Person) {

  @Expose()
  @Column({dataType: DataType.GUID})
  cid: string;

  @Expose()
  @Column()
  identity: string;

  @Expose()
  @Column({default: true})
  active: boolean;

  @Expose()
  @Column({default: false})
  vip: boolean;

  @Expose()
  @Column()
  countryCode: string;

  @Expose()
  @Column()
  city?: string;

  @Expose()
  @Column({exclusive: true})
  address?: Address;

  @Expose()
  @Link().toOne(Country)
  country: Country;

  @Expose()
  @Link({exclusive: true}).toMany(CustomerNote, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNote[];

}
