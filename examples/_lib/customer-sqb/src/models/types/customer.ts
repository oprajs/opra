import '@opra/sqb';
import { PartialDTO } from 'ts-gems';
import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Column, Entity, Link } from '@sqb/connect';
import { Address } from './address.js';
import { Country } from './country.js';
import { Note } from './note.js';
import { Person } from './person.js';
import { Record } from './record.js';

@ComplexType({
  description: 'Customer information',
})
@Entity('customers')
export class Customer extends MixinType(Record, Person) {
  constructor(init?: PartialDTO<Customer>) {
    super(init);
  }

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

  @ApiField({ exclusive: true })
  @Column({ type: Address, exclusive: true })
  address?: Address;

  @ApiField({ type: Note, exclusive: true })
  @Column({ type: Note, exclusive: true })
  notes?: Note[];

  @ApiField({ exclusive: true })
  @Link({ exclusive: true }).toOne(Country, { sourceKey: 'countryCode', targetKey: 'code' })
  readonly country?: Country;
}
