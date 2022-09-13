import { ApiComplexType, ApiProperty } from '@opra/common';

@ApiComplexType({
  description: 'Address information',
  additionalProperties: true
})
export class Notes {

  @ApiProperty()
  text: string;

}
