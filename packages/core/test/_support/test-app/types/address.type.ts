import { OprComplexType, OprField } from '@opra/schema';
import { Country } from '../entities/country.entity.js';

@OprComplexType({
  description: 'Address information'
})
export class Address {

  @OprField()
  city: string;

  @OprField()
  countryCode: string;

  @OprField({
    exclusive: true
  })
  country: Country;

  @OprField()
  street: string;

  @OprField()
  zipCode: string;

}
