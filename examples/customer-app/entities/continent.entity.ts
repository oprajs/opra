import '@opra/sqb';
import { ApiField, ComplexType } from '@opra/common';
import { Column, Entity, Link, PrimaryKey } from '@sqb/connect';
import type { Country } from './country.entity.js';

@ComplexType()
@Entity('continents')
export class Continent {

  @ApiField()
  @PrimaryKey()
  @Column()
  code: string;

  @ApiField()
  @Column()
  name: string;

  @ApiField()
  @Link({exclusive: true})
      .toMany(async () => (await import('./country.entity.js')).Country)
  countries: Country[];

}
