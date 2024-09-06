import { ApiField, ComplexType } from '@opra/common';
import { Record } from './record.js';

@ComplexType({
  description: 'Address information',
})
export class Address extends Record {
  @ApiField()
  declare city: string;

  @ApiField()
  declare countryCode: string;

  @ApiField()
  declare street: string;

  @ApiField()
  declare zipCode: string;
}
