import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType()
@Entity('countries')
export class Country {

  @ApiField()
  @Column()
  @PrimaryKey()
  code: string;

  @ApiField()
  @Column()
  name: string;

  @ApiField()
  @Column()
  phoneCode: string;

  @ApiField()
  @Column()
  flag: string;
}
