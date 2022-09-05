import { ApiComplexType, ApiProperty } from '@opra/common';
import { Country } from './country.dto';

@ApiComplexType({
  description: 'Address information'
})
export class Address {

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: Country;

  @ApiProperty()
  street: string;

  @ApiProperty()
  zipCode: string;

}
