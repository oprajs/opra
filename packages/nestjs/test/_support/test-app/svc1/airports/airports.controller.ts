import {GetOpraRequest, Opra, OpraRequest} from '@opra/nestjs';
import {Airport} from './airport.dto';
import {AirportsService} from './airports.service';

@Opra.Api.Controller(Airport)
export class AirportsController {
  constructor(public airportsService: AirportsService) {
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
