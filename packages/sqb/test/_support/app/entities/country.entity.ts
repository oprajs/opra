import { ComplexField, ComplexType } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType()
@Entity('countries')
export class Country {

  @ComplexField()
  @Column()
  @PrimaryKey()
  code: string;

  @ComplexField()
  @Column()
  name: string;

  @ComplexField()
  @Column()
  phoneCode: string;

  @ComplexField()
  @Column()
  flag: string;
}
