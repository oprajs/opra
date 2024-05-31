import { ApiField, ComplexType } from '@opra/common';
import { Record } from './record.type.js';

@ComplexType({
  description: 'Address information',
})
export class Address extends Record {
  @ApiField()
  city: string;

  @ApiField()
  countryCode: string;

  @ApiField()
  street: string;

  @ApiField()
  zipCode: string;
}
