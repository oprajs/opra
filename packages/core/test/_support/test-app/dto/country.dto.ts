import { ApiEntityType, ApiProperty } from '@opra/common';

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
