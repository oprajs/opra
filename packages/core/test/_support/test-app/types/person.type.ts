import { ApiField, ComplexType } from '@opra/common';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @ApiField()
  givenName: string;

  @ApiField()
  familyName: string;

  @ApiField({enum: GenderEnum})
  gender: GenderEnum;

  @ApiField()
  birthDate?: Date;
}
