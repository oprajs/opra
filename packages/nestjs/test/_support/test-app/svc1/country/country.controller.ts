import {api, RequestNode} from '@opra/nestjs';
import {Country} from './country.dto.js';
import {CountryService} from './country.service.js';

@api.Collection(Country)
export class CountryController {
  constructor(public cityService: CountryService) {
  }

  @api.collection.List()
  async findAll(@api.Request() request: RequestNode): Promise<any> {
    return this.cityService.findAll(request);
  }

  @api.collection.Get()
  async get(@api.Request() request: RequestNode): Promise<any> {
    return this.cityService.get(request);
  }

}
