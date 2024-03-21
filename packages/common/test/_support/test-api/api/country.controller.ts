import { HttpOperation, HttpResource } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@HttpResource({
  description: 'Country resource',
  name: 'Countries'
}).KeyParameter('code')
export class CountryController {

  @HttpOperation.Entity.Get(Country, 'id')
  get() {
    //
  }

}
