import '@opra/sqb';
import { ComplexType, Expose } from '@opra/common';
import { Column, Entity, Link, PrimaryKey } from '@sqb/connect';
import type { Country } from './country.entity.js';

@ComplexType()
@Entity('continents')
export class Continent {

  @Expose()
  @PrimaryKey()
  @Column()
  code: string;

  @Expose()
  @Column()
  name: string;

  @Expose()
  @Link().toMany(async () => (await import('./country.entity.js')).Country)
  countries: Country[];

}
