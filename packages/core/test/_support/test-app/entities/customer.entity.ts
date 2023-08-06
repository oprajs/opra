import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Address } from '../types/address.type.js';
import { Note } from '../types/note.type.js';
import { Person } from '../types/person.type.js';
import { Record } from '../types/record.type.js';
import { Country } from './country.entity.js';

@ComplexType({
  description: 'Customer information',
})
export class Customer extends UnionType(Record, Person) {

  @ApiField()
  uid?: string;

  @ApiField()
  active: boolean;

  @ApiField()
  countryCode: string;

  @ApiField()
  rate: number;

  @ApiField({type: Address, exclusive: true})
  address?: Address;

  @ApiField({type: Note, exclusive: true})
  notes?: Note[];

  @ApiField({exclusive: true})
  readonly country?: Country;

}
