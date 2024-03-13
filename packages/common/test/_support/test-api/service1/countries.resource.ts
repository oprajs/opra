import { HttpOperation, HttpResource } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@HttpResource({
  description: 'Country resource',
}).KeyParameter('code')
export class CountriesResource {

  @HttpOperation.Entity.Get(Country, 'id')
  get() {
    //
  }

}
