import { ApiField, ComplexType } from '@opra/common';
import { Continent } from './continent.entity.js';

@ComplexType({
  description: 'Country information'
})
export class Country {

  @ApiField()
  code: string;

  @ApiField()
  name: string;

  @ApiField()
  phoneCode?: string;

  @ApiField({type: async () => (await import('./continent.entity.js')).Continent})
  continent: Continent;

}
