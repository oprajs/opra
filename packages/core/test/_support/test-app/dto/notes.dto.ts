import { ApiComplexType, ApiProperty } from '@opra/schema';

@ApiComplexType({
  description: 'Address information',
  additionalProperties: true
})
export class Notes {

  @ApiProperty()
  text: string;

}
