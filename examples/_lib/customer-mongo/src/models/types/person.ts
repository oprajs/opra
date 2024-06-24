import { ApiField, ComplexType } from '@opra/common';
import { Gender } from '../enums/gender.js';

@ComplexType({
  description: 'Person information',
})
export class Person {
  @ApiField()
  givenName: string;

  @ApiField()
  familyName: string;

  @ApiField({ type: Gender })
  gender: Gender;

  @ApiField()
  birthDate?: Date;
}
