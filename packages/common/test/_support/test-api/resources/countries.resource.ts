import { Collection } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@Collection(Country, {
  description: 'Country resource',
  primaryKey: 'code'
})
export class CountriesResource {

  @Collection.FindMany()
  findMany() {
    //
  }

  @Collection.Get()
  get() {
    //
  }

}
