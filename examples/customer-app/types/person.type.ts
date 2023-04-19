import { ComplexField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @ComplexField()
  @Column({fieldName: 'given_name', notNull: true})
  givenName: string;

  @ComplexField()
  @Column({fieldName: 'family_name', notNull: true})
  familyName: string;

  @ComplexField({enum: GenderEnum})
  @Column({notNull: true})
  gender: string;

  @ComplexField()
  @Column({fieldName: 'birth_name', dataType: DataType.DATE})
  birthDate: Date;
}
