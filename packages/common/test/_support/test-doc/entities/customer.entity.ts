import { ComplexField, ComplexType, UnionType } from '@opra/common';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer information',
})
export class Customer extends UnionType(Record, Person) {

  @ComplexField()
  cid: string;

  @ComplexField({required: false})
  identity: string;

  @ComplexField()
  city: string;

  @ComplexField()
  countryCode: string;

  @ComplexField()
  active: boolean;

  @ComplexField({type: 'integer'})
  vip: number;

  @ComplexField()
  address?: Address;

  @ComplexField({type: CustomerNotes})
  notes?: CustomerNotes[];

  @ComplexField()
  fieldInteger: number;

  @ComplexField()
  fieldBigint: bigint;

  @ComplexField()
  fieldGuid: string;

}
