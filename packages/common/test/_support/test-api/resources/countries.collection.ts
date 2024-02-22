import { ApiOperation, ApiResource } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@ApiResource({
  description: 'Countries collection',
})
export class CountriesCollection {

  @ApiOperation.Entity.FindMany(Country)
  findMany() {
    //
  }

}
