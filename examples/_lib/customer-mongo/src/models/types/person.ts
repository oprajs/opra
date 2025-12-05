import { ApiField, ComplexType } from '@opra/common';
import { Gender } from '../enums/gender.js';

@ComplexType({
  description: 'Person information',
})
export class Person {
  @ApiField()
  declare givenName: string;

  @ApiField()
  declare familyName: string;

  @ApiField({ type: Gender })
  declare gender: Gender;

  @ApiField({
    type: 'date',
  })
  declare birthDate?: Date;

  @ApiField()
  declare date2?: string;
}
