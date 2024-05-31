import { HttpController, HttpOperation } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@HttpController({
  description: 'Country resource',
  path: 'Countries@:countryCode',
}).PathParam('countryCode', String)
export class CountryController {
  @HttpOperation.Entity.Get(Country)
  get() {
    //
  }

  @HttpOperation.Entity.Delete(Country)
  delete() {
    //
  }

  @HttpOperation.Entity.Update(Country)
  update() {
    //
  }
}
