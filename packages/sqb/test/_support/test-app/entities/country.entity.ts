import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity } from '@sqb/connect';

@ComplexType({
  description: 'Country information'
})
@Entity('countries')
export class Country {

  @ApiField()
  @Column()
  code: string;

  @ApiField()
  @Column()
  name: string;

  @ApiField()
  @Column()
  phoneCode?: string;

}
