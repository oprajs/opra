import { MixinType, OprComplexType, OprField } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { Country } from './country.entity.js';
import { CustomerNote } from './customer-note.entity.js';
import { Record } from './record.entity.js';

@OprComplexType()
@Entity('customers')
export class Customer extends MixinType(Record, Person) {

  @OprField()
  @Column({dataType: DataType.GUID})
  cid: string;

  @OprField()
  @Column()
  identity: string;

  @OprField()
  @Column({default: true})
  active: boolean;

  @OprField()
  @Column({default: false})
  vip: boolean;

  @OprField()
  @Column({fieldName: 'country_code'})
  countryCode: string;

  @OprField()
  @Column()
  city?: string;

  @OprField()
  @Column({exclusive: true})
  address?: Address;

  @OprField()
  @Link().toOne(Country)
  country: Country;

  @OprField()
  @Link({exclusive: true}).toMany(CustomerNote, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNote[];

}
