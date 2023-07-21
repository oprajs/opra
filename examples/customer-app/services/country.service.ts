import { Injectable } from '@nestjs/common';
import { SqbEntityService } from '@opra/sqb';
import { SqbClient } from '@sqb/connect';
import { Country } from '../entities/country.entity.js';

@Injectable()
export class CountryService extends SqbEntityService<Country> {

  constructor(db: SqbClient) {
    super(Country, {db})
  }

}
