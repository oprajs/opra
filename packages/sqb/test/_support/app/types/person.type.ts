import { ComplexField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { Gender } from '../enums/gender.enum.js';

@ComplexType()
export class Person {

  @ComplexField()
  @Column({notNull: true})
  givenName: string;

  @ComplexField()
  @Column({notNull: true})
  familyName: string;

  @ComplexField({enum: Gender})
  @Column({notNull: true})
  gender: Gender;

  @ComplexField()
  @Column({dataType: DataType.DATE})
  birthDate: Date;
}
