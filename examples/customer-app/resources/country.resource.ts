import { Collection } from '@opra/common';
import { RequestContext } from '@opra/core';
import { SqbCollectionResource, SqbEntityService } from '@opra/sqb';
import { Country } from '../entities/country.entity.js';
import { CountryService } from '../services/country.service.js';

@Collection(Country, {
  name: 'Countries',
  description: 'Country resource'
})
export class CountryResource extends SqbCollectionResource<Country> {
  constructor(public countryService: CountryService) {
    super();
  }

  getService(ctx: RequestContext): SqbEntityService<Country> {
    return this.countryService.with(ctx);
  }
}
