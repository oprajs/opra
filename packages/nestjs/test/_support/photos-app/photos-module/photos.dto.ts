import { ApiEntityType, ApiProperty } from '@opra/common';

@ApiEntityType({
  primaryKey: 'id'
})
export class Customer {

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  views: number;
}
