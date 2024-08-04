import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';
import { Gender } from '../enums/gender.js';

@ComplexType({
  description: 'Person information',
})
export class Person {
  @ApiField()
  @Column()
  declare givenName: string;

  @ApiField()
  @Column()
  declare familyName: string;

  @ApiField({ type: Gender })
  @Column()
  declare gender: Gender;

  @ApiField()
  @Column()
  declare birthDate?: Date;
}
