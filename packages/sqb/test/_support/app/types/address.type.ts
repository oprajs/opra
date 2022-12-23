import { OprComplexType, OprField } from '@opra/common';
import { Country } from '../entities/country.entity.js';

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
