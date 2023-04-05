import '@opra/sqb';
import { ComplexType, Expose } from '@opra/common';
import { Column, DataType, Entity, Link } from '@sqb/connect';
import { Continent } from './continent.entity.js';

@ComplexType({
  description: 'Country information'
})
@Entity()
export class Country {

  @Expose()
  @Column({notNull: true, dataType: DataType.GUID})
  code: string;

  @Expose()
  @Column({notNull: true})
  name: string;

  @Expose()
  phoneCode?: string;

  @Expose()
  @Link().toOne(async () => (await import('./continent.entity.js')).Continent)
  continent: Continent;

}
