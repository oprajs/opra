import {GetOpraRequest, Opra,OpraRequest} from '@opra/nestjs';
import {CitiesService} from './cities.service';
import {City} from './city.dto';

@Opra.Api.Controller(City)
export class CitiesController {
  constructor(public airportsService: CitiesService) {
    // eslint-disable-next-line no-console
    console.log(1);
  }

  @Opra.Api.List()
  async findAll(@GetOpraRequest() request: OpraRequest): Promise<any> {
    const items = this.airportsService.findAll(request);
    return {
      items,
      request
    }
  }

}
