import { OprComplexType, OprField } from '../../../src/index.js';
import { Country } from '../entities/country.entity.js';

@OprComplexType({
  description: 'Address information'
})
export class Address {

  @OprField()
  city: string;

  @OprField()
  country: Country;

  @OprField()
  street: string;

  @OprField()
  zipCode: string;

}
