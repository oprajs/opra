import { OprComplexType, OprField } from '@opra/common';

@OprComplexType()
export class Address {

  @OprField()
  city: string;

  @OprField()
  countryCode: string;

  @OprField()
  street: string;

  @OprField()
  zipCode: string;

}
