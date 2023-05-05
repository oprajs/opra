import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Note } from '../types/note.type.js';
import { Person } from '../types/person.type.js';
import { Record } from '../types/record.type.js';
import { Country } from './country.entity.js';

@ComplexType({
  description: 'Customer information',
})
@Entity('customers')
export class Customer extends UnionType(Record, Person) {

  @ApiField()
  @Column({dataType: DataType.VARCHAR})
  uid?: string;

  @ApiField()
  @Column({default: true})
  active: boolean;

  @ApiField()
  @Column()
  countryCode: string;

  @ApiField()
  @Column()
  rate: number;

  @ApiField({type: Address, exclusive: true})
  @Column({exclusive: true})
  address?: Address;

  @ApiField({type: Note, exclusive: true})
  @Column({type: Note, isArray: true, exclusive: true})
  notes?: Note[];

  @ApiField({exclusive: true})
  @Link({exclusive: true}).toOne(Country)
  readonly country?: Country;

}
