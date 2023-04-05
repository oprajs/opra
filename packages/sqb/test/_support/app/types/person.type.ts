import { ComplexType, Expose } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { Gender } from '../enums/gender.enum.js';

@ComplexType()
export class Person {

  @Expose()
  @Column({notNull: true})
  givenName: string;

  @Expose()
  @Column({notNull: true})
  familyName: string;

  @Expose({enum: Gender})
  @Column({notNull: true})
  gender: Gender;

  @Expose()
  @Column({dataType: DataType.DATE})
  birthDate: Date;
}
