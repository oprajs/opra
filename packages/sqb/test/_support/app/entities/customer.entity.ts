import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Country } from './country.entity.js';
import { CustomerNote } from './customer-note.entity.js';
import { Record } from './record.entity.js';

@ComplexType()
@Entity('customers')
export class Customer extends UnionType(Record, Person) {

  @ApiField()
  @Column({dataType: DataType.GUID})
  cid: string;

  @ApiField()
  @Column()
  identity: string;

  @ApiField()
  @Column({default: true})
  active: boolean;

  @ApiField()
  @Column({default: false})
  vip: boolean;

  @ApiField()
  @Column()
  countryCode: string;

  @ApiField()
  @Column()
  city?: string;

  @ApiField()
  @Column({exclusive: true})
  address?: Address;

  @ApiField()
  @Link().toOne(Country)
  country: Country;

  @ApiField()
  @Link({exclusive: true}).toMany(CustomerNote, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNote[];

}
