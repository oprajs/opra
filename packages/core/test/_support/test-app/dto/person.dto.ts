import { ApiComplexType, ApiProperty } from '@opra/common';

@ApiComplexType({
  description: 'Person information'
})
export class Person {

  @ApiProperty()
  givenName: string;

  @ApiProperty()
  familyName: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  birthDate: string;

}
