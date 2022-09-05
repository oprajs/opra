import { ApiComplexType, ApiProperty } from '@opra/common';

@ApiComplexType({
  description: 'Country information'
})
export class Country {

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phoneCode: string;

}
