import { ApiComplexType, ApiProperty } from '@opra/common';
import { Address } from './address.dto';
import { Person } from './person.dto';

@ApiComplexType()
export class Customer extends Person {

  @ApiProperty({type: 'integer'})
  id: number;

  @ApiProperty()
  cid: string;

  @ApiProperty()
  identity: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  countryCode: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty({type: 'integer'})
  vip: number;

  @ApiProperty({
    exclusive: true
  })
  address?: Address;

}
