import { ApiField, ComplexType, UnionType } from '@opra/common';
import { Embedded, Entity, Link } from '@sqb/connect';
import { Address } from '../types/address.type.js';
import { Person } from '../types/person.type.js';
import { CustomerNotes } from './customer-notes.entity.js';
import { Record } from './record.entity.js';

@ComplexType({
  description: 'Customer information',
})
@Entity({tableName: 'customers'})
export class Customer extends UnionType(Record, Person) {

  @ApiField()
  @Embedded(Address, {fieldNamePrefix: 'address_'})
  address?: Address;

  @ApiField()
  @Link({exclusive: true})
      .toMany(CustomerNotes, {sourceKey: 'id', targetKey: 'customerId'})
  notes?: CustomerNotes[];

}
