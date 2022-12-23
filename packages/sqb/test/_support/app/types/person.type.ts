import { OprComplexType, OprField } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { Gender } from '../enums/gender.enum.js';

@OprComplexType()
export class Person {

  @OprField()
  @Column({fieldName: 'given_name', notNull: true})
  givenName: string;

  @OprField()
  @Column({fieldName: 'family_name', notNull: true})
  familyName: string;

  @OprField({enum: Gender})
  @Column({notNull: true})
  gender: Gender;

  @OprField()
  @Column({fieldName: 'birth_date', dataType: DataType.DATE})
  birthDate: Date;
}
