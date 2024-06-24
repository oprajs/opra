import { ApiField, ComplexType } from '@opra/common';
import { Column } from '@sqb/connect';
import { Gender } from '../enums/gender.js';

@ComplexType({
  description: 'Person information',
})
export class Person {
  @ApiField()
  @Column()
  givenName: string;

  @ApiField()
  @Column()
  familyName: string;

  @ApiField({ type: Gender })
  @Column()
  gender: Gender;

  @ApiField()
  @Column()
  birthDate?: Date;
}
