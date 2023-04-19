import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { Gender } from '../enums/gender.enum.js';

@ComplexType()
export class Person {

  @ApiField()
  @Column({notNull: true})
  givenName: string;

  @ApiField()
  @Column({notNull: true})
  familyName: string;

  @ApiField({enum: Gender})
  @Column({notNull: true})
  gender: Gender;

  @ApiField()
  @Column({dataType: DataType.DATE})
  birthDate: Date;
}
