import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType } from '@sqb/connect';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @ApiField()
  @Column({notNull: true})
  givenName: string;

  @ApiField()
  @Column({notNull: true})
  familyName: string;

  @ApiField({enum: GenderEnum})
  @Column({notNull: true, default: 'U'})
  gender: GenderEnum;

  @ApiField()
  @Column({dataType: DataType.DATE})
  birthDate?: Date;
}
