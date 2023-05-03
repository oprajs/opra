import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity, PrimaryKey } from '@sqb/connect';

@ComplexType({
  description: 'Country information'
})
@Entity('countries')
export class Country {

  @ApiField()
  @PrimaryKey()
  @Column({notNull: true})
  code: string;

  @ApiField()
  @Column({notNull: true})
  name: string;

  @ApiField()
  @Column({exclusive: true})
  phoneCode?: string;

}
