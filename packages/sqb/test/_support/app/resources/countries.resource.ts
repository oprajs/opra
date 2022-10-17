import { CollectionResourceController, IEntityService } from '@opra/core';
import { OprCollectionResource, OprSearchResolver } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
import { Country } from '../entities/country.entity.js';
import { CountryService } from '../services/country.service.js';

@OprCollectionResource(Country)
export class CountriesResource extends CollectionResourceController<Country> {
  readonly countryService: CountryService;

  constructor(readonly db: SqbClient) {
    super();
    this.countryService = new CountryService(db);
  }

  @OprSearchResolver()
  search;

  getService(): IEntityService {
    return this.countryService;
  }

}
