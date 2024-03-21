import { HttpOperation, HttpResource } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@HttpResource({
  description: 'Countries collection',
})
export class CountriesController {

  @HttpOperation.Entity.FindMany(Country)
  findMany() {
    //
  }

}
