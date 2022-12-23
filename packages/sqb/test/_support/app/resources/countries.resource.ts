import { OprCollectionResource, OprSearchResolver } from '@opra/common';
import { SqbClient } from '@sqb/connect';
import { BaseEntityResource, BaseEntityService } from '../../../../src/index.js';
import { Country } from '../entities/country.entity.js';
import { CountryService } from '../services/country.service.js';

@OprCollectionResource(Country)
export class CountriesResource extends BaseEntityResource<Country> {
  readonly countryService: CountryService;

  constructor(readonly db: SqbClient) {
    super();
    this.countryService = new CountryService(db);
  }

  @OprSearchResolver()
  search;

  getService(): BaseEntityService<Country> {
    return this.countryService;
  }

}
