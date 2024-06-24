import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';
import { Record } from './record.js';

@ComplexType({
  description: 'Address information',
})
export class Address extends Record {
  @ApiField()
  @Column()
  city: string;

  @ApiField()
  @Column()
  countryCode: string;

  @ApiField()
  @Column()
  street: string;

  @ApiField()
  @Column()
  zipCode: string;
}
