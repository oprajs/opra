import { Injectable } from '@nestjs/common';
import { SqbClient } from '@sqb/connect';
import { SqbEntityService } from '../../../../src/index.js';
import { Country } from '../entities/country.entity.js';

@Injectable()
export class CountryService extends SqbEntityService<Country> {

  constructor(readonly db: SqbClient) {
    super(Country);
  }

  protected getConnection() {
    return this.db;
  }

}
