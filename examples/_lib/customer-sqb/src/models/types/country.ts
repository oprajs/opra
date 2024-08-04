import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';

@ComplexType({
  description: 'Country information',
})
@Entity('countries')
export class Country {
  @ApiField()
  @Column()
  declare code: string;

  @ApiField()
  @Column()
  declare name: string;

  @ApiField()
  @Column()
  declare phoneCode?: string;
}
