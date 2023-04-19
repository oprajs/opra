import { ApiField, ComplexType } from '@opra/common';
import type { Country } from './country.entity.js';

@ComplexType()
export class Continent {

  @ApiField()
  code: string;

  @ApiField()
  name: string;

  @ApiField({type: async () => (await import('./country.entity.js')).Country})
  countries: Country[];

}
