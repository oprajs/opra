import { ApiEntityType, ApiProperty } from '@opra/schema';

@ApiEntityType({
  primaryKey: 'id'
})
export class Cat {

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;
}
