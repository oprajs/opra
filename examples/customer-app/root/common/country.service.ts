import { Injectable } from '@nestjs/common';
import { SqbEntityService } from '@opra/sqb';
import { app } from '../../app.js';
import { Country } from '../../types/entities/country.entity.js';

@Injectable()
export class CountryService extends SqbEntityService<Country> {

  constructor() {
    super(Country, {db: app.db})
  }

}
