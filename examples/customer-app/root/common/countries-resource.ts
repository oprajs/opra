import { Collection } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SqbCollection, SqbEntityService } from '@opra/sqb';
import { Country } from '../../types/entities/country.entity.js';
import { CountryService } from './country.service.js';

@Collection(Country, {
  name: 'Countries',
  description: 'Country resource'
})
export class CountriesResource extends SqbCollection<Country> {
  countryService = new CountryService();


  @Collection.Get()
  get;

  @Collection.FindMany()
  findMany;


  getService(ctx: RequestContext): SqbEntityService<Country> {
    return this.countryService.for(ctx);
  }
}
