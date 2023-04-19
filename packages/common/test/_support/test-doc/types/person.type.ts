import { ComplexField, ComplexType } from '@opra/common';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @ComplexField()
  givenName: string;

  @ComplexField()
  familyName: string;

  @ComplexField({enum: GenderEnum})
  gender: string;

  @ComplexField()
  birthDate: Date;
}
