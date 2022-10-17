import { Column, DataType } from '@sqb/connect';
import { OprComplexType, OprField } from '../../../../src/index.js';

@OprComplexType({
  description: 'Person information'
})
export class Person {

  @OprField()
  @Column({notNull: true})
  givenName: string;

  @OprField()
  @Column({notNull: true})
  familyName: string;

  @OprField({
    enum: ['M', 'F', 'U', 'O']
  })
  @Column({notNull: true})
  gender: string;

  @OprField()
  @Column({dataType: DataType.DATE})
  birthDate: Date;
}
