import { ApiEntityType, ApiProperty } from '@opra/schema';
import { Address } from './address.dto.js';
import { Notes } from './notes.dto.js';
import { Person } from './person.dto.js';

@ApiEntityType({
  primaryKey: 'id',
  description: 'Customer information'
})
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

  @ApiProperty({
    exclusive: true
  })
  notes?: Notes;

}
