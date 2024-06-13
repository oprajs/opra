import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Column, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Note } from '../types/note.type.js';
import { Person } from '../types/person.type.js';
import { Record } from '../types/record.type.js';
import { Country } from './country.entity.js';

@ComplexType({
  description: 'Customer information',
})
@Entity('customers')
export class Customer extends MixinType(Record, Person) {
  @ApiField()
  @Column()
  uid?: string;

  @ApiField()
  @Column()
  active: boolean;

  @ApiField()
  @Column()
  countryCode: string;

  @ApiField()
  @Column()
  rate: number;

  @ApiField()
  @Column({ type: Address, exclusive: true })
  address?: Address;

  @ApiField()
  @Column({ type: Note, exclusive: true })
  notes?: Note[];

  @ApiField({ exclusive: true })
  @Link({ exclusive: true }).toOne(Country, { sourceKey: 'countryCode', targetKey: 'code' })
  readonly country?: Country;
}
