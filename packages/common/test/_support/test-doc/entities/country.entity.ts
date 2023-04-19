import { ComplexField, ComplexType } from '@opra/common';
import { Continent } from './continent.entity.js';

@ComplexType({
  description: 'Country information'
})
export class Country {

  @ComplexField()
  code: string;

  @ComplexField()
  name: string;

  @ComplexField()
  phoneCode?: string;

  @ComplexField({type: async () => (await import('./continent.entity.js')).Continent})
  continent: Continent;

}
