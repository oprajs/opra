import { ApiField, ComplexType } from '@opra/common';

@ComplexType({
  description: 'Address information',
})
export class Address {
  @ApiField()
  city: string;

  @ApiField()
  countryCode: string;

  @ApiField()
  street: string;

  @ApiField()
  zipCode: string;
}
