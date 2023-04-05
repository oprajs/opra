import { ComplexType, Expose } from '@opra/common';
import { Column, DataType } from '@sqb/connect';

@ComplexType({
  description: 'Person information'
})
export class Person {

  @Expose()
  @Column({notNull: true})
  givenName: string;

  @Expose()
  @Column({notNull: true})
  familyName: string;

  @Expose(
      // {enum: ['M', 'F', 'U', 'O']} todo enums
  )
  @Column({notNull: true})
  gender: string;

  @Expose()
  @Column({dataType: DataType.DATE})
  birthDate: Date;
}
