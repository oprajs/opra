import { PartialDTO } from 'ts-gems';
import { ApiField, ComplexType, MixinType } from '@opra/common';
import { Address } from './address.js';
import { Country } from './country.js';
import { Note } from './note.js';
import { Person } from './person.js';
import { Record } from './record.js';

@ComplexType({
  description: 'Customer information',
})
export class Customer extends MixinType(Record, Person) {
  constructor(init?: PartialDTO<Customer>) {
    super(init);
  }

  @ApiField()
  uid?: string;

  @ApiField()
  active: boolean;

  @ApiField()
  countryCode: string;

  @ApiField()
  rate: number;

  @ApiField({ exclusive: true })
  address?: Address;

  @ApiField({ type: Note, exclusive: true })
  notes?: Note[];

  @ApiField({ exclusive: true })
  readonly country?: Country;
}
