import '@opra/sqb';
import { Column, Entity, Link, PrimaryKey } from '@sqb/connect';
import { OprComplexType, OprField } from '../../../../../src/index.js';
import type { Country } from './country.entity.js';

@OprComplexType()
@Entity('continents')
export class Continent {

  @OprField()
  @PrimaryKey()
  @Column()
  code: string;

  @OprField()
  @Column()
  name: string;

  @OprField()
  @Link().toMany(async () => (await import('./country.entity.js')).Country)
  countries: Country[];

}
