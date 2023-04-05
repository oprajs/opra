import { ComplexType, Expose } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType()
@Entity('countries')
export class Country {

  @Expose()
  @Column()
  @PrimaryKey()
  code: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column()
  phoneCode: string;

  @Expose()
  @Column()
  flag: string;
}
