import { Entity, Link } from '@sqb/connect';
import { OprComplexType, OprField } from '../../../../../src/index.js';
import type { Continent } from './continent.entity.js';
import { Record } from './record.entity.js';

@OprComplexType({
  description: 'Country information'
})
@Entity()
export class Country extends Record {

  @OprField()
  code: string;

  @OprField()
  name: string;

  @OprField()
  phoneCode: string;

  @OprField()
  @Link().toOne(async () => (await import('./continent.entity.js')).Continent)
  continent: Continent;

}
