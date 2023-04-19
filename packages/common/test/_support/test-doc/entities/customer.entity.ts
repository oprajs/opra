import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer information',
})
export class Customer extends UnionType(Record, Person) {

  @ApiField()
  cid: string;

  @ApiField({required: false})
  identity: string;

  @ApiField()
  city: string;

  @ApiField()
  countryCode: string;

  @ApiField()
  active: boolean;

  @ApiField({type: 'integer'})
  vip: number;

  @ApiField()
  address?: Address;

  @ApiField({type: CustomerNotes})
  notes?: CustomerNotes[];

  @ApiField()
  fieldInteger: number;

  @ApiField()
  fieldBigint: bigint;

  @ApiField()
  fieldGuid: string;

}
