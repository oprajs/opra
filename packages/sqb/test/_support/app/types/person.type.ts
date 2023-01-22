import { OprComplexType, OprField } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { Gender } from '../enums/gender.enum.js';

@OprComplexType()
export class Person {

  @OprField()
  @Column({notNull: true})
  givenName: string;

  @OprField()
  @Column({notNull: true})
  familyName: string;

  @OprField({enum: Gender})
  @Column({notNull: true})
  gender: Gender;

  @OprField()
  @Column({dataType: DataType.DATE})
  birthDate: Date;
}
