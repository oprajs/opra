import { Column, DataType, Entity, Link } from '@sqb/connect';
import { MixinType, OprComplexType, OprField } from '../../../../src/index.js';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Customer information',
})
@Entity()
export class Customer extends MixinType(Record, Person) {

  @OprField()
  @Column({dataType: DataType.GUID, notNull: true})
  cid: string;

  @OprField({required: false})
  @Column({notNull: true})
  identity: string;

  @OprField()
  @Column()
  city: string;

  @OprField()
  @Column()
  countryCode: string;

  @OprField()
  @Column({default: true})
  active: boolean;

  @OprField({type: 'integer'})
  @Column({exclusive: true})
  vip: number;

  @OprField()
  @Link({exclusive: true}).toOne(Address)
  address?: Address;

  @OprField()
  @Link({exclusive: true}).toMany(CustomerNotes, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNotes[];

  @OprField()
  @Column({dataType: DataType.INTEGER})
  fieldInteger: number;

  @OprField()
  @Column({dataType: DataType.BIGINT})
  fieldBigint: bigint;

  @OprField()
  @Column({dataType: DataType.GUID})
  fieldGuid: string;

}
