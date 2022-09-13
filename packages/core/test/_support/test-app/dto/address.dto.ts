import { ApiEntityType, ApiProperty } from '@opra/schema';
import { Country } from './country.dto.js';

@ApiEntityType({
  description: 'Address information',
  primaryKey: 'id'
})
export class Address {

  @ApiProperty()
  id: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  country: Country;

  @ApiProperty()
  street: string;

  @ApiProperty()
  zipCode: string;

}
