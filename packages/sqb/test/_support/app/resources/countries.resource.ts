import { EntityResourceController, IEntityService } from '@opra/core';
import { OprEntityResource, OprSearchResolver } from '@opra/schema';
import { SqbClient } from '@sqb/connect';
import { Country } from '../entities/country.entity.js';
import { CountryService } from '../services/country.service.js';

@OprEntityResource(Country)
export class CountriesResource extends EntityResourceController<Country> {
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
