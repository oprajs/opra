import {Api, ContextHost} from '@opra/nestjs';
import {Country} from './country.dto.js';
import {CountryService} from './country.service.js';

@Api.Collection(Country)
export class CountryController {
  constructor(public cityService: CountryService) {
  }

  @Api.collection.List()
  async findAll(@Api.Request() request: ContextHost): Promise<any> {
    return this.cityService.findAll(request);
  }

  @Api.collection.Get()
  async get(@Api.Request() request: ContextHost): Promise<any> {
    return this.cityService.get(request);
  }

}
