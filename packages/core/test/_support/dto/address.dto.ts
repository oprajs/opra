import { ComplexType, Property } from '@opra/common';
import { Country } from './country.dto';

@ComplexType({
  description: 'Address information'
})
export class Address {

  @Property()
  city: string;

  @Property()
  country: Country;

  @Property()
  street: string;

  @Property()
  zipCode: string;

}
