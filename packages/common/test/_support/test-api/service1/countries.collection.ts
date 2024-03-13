import { HttpOperation, HttpResource } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@HttpResource({
  description: 'Countries collection',
})
export class CountriesCollection {

  @HttpOperation.Entity.FindMany(Country)
  findMany() {
    //
  }

}
