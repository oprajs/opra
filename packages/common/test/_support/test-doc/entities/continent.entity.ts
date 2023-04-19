import { ComplexField, ComplexType } from '@opra/common';
import type { Country } from './country.entity.js';

@ComplexType()
export class Continent {

  @ComplexField()
  code: string;

  @ComplexField()
  name: string;

  @ComplexField({type: async () => (await import('./country.entity.js')).Country})
  countries: Country[];

}
