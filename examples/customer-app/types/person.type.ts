import { ComplexType, Expose } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @Expose()
  @Column({fieldName: 'given_name', notNull: true})
  givenName: string;

  @Expose()
  @Column({fieldName: 'family_name', notNull: true})
  familyName: string;

  @Expose({enum: GenderEnum})
  @Column({notNull: true})
  gender: string;

  @Expose()
  @Column({fieldName: 'birth_name', dataType: DataType.DATE})
  birthDate: Date;
}
