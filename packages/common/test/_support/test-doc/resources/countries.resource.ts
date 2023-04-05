import { Collection } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@Collection(Country, {
  description: 'Country resource',
  primaryKey: 'code'
})
export class CountryResource {

  @Collection.SearchOperation()
  search() {
    //
  }

  @Collection.GetOperation()
  get() {
    //
  }

}
