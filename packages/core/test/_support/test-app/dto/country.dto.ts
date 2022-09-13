import { ApiEntityType, ApiProperty } from '@opra/schema';

@ApiEntityType({
  description: 'Country information',
  primaryKey: 'code'
})
export class Country {

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneCode: string;

}
