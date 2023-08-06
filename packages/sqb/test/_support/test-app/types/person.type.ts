import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';
import { GenderEnum } from '../enums/gender.enum.js';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @ApiField()
  @Column()
  givenName: string;

  @ApiField()
  @Column()
  familyName: string;

  @ApiField({enum: GenderEnum})
  @Column()
  gender: GenderEnum;

  @ApiField()
  @Column()
  birthDate?: Date;
}
