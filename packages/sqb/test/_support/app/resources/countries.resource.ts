import { Collection } from '@opra/common';
import { SqbClient } from '@sqb/connect';
import { SqbCollectionResource, SqbEntityService } from '../../../../src/index.js';
import { Country } from '../entities/country.entity.js';
import { CountryService } from '../services/country.service.js';

@Collection(Country)
export class CountriesResource extends SqbCollectionResource<Country> {
  readonly countryService: CountryService;

  constructor(readonly db: SqbClient) {
    super();
    this.countryService = new CountryService(db);
  }

  getService(): SqbEntityService<Country> {
    return this.countryService;
  }

}
