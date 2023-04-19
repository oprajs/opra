import { ApiField, ComplexType } from '@opra/common';

@ComplexType()
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
