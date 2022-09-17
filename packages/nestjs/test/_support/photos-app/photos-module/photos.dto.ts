import { ApiEntityType, ApiProperty } from '@opra/schema';

@ApiEntityType({
  primaryKey: 'id'
})
export class Photos {

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  views: number;
}
