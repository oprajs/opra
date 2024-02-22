import { ApiOperation, ApiResource } from '@opra/common';
import { Country } from '../entities/country.entity.js';

@ApiResource({
  description: 'Country resource',
}).KeyParameter('code')
export class CountriesResource {

  @ApiOperation.Entity.FindOne(Country)
  get() {
    //
  }

}
