import '@opra/sqb';
import { ApiField, ComplexType } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Continent } from './continent.entity.js';

@ComplexType({
  description: 'Country information'
})
@Entity()
export class Country {

  @ApiField()
  @Column({notNull: true, dataType: DataType.GUID})
  code: string;

  @ApiField()
  @Column({notNull: true})
  name: string;

  @ApiField()
  phoneCode?: string;

  @ApiField()
  @Link().toOne(async () => (await import('./continent.entity.js')).Continent)
  continent: Continent;

}
