import {api, RequestNode} from '@opra/nestjs';
import {Customer} from './customer.dto.js';
import {CustomerService} from './customer.service.js';

@api.Collection(Customer)
export class CustomerController {
  constructor(public airportsService: CustomerService) {
  }

  @api.collection.List()
  async findAll(@api.Request() request: RequestNode): Promise<any> {
    return this.airportsService.findAll(request);
  }

  @api.collection.Get()
  async get(@api.Request() request: RequestNode): Promise<any> {
    return this.airportsService.get(request);
  }

}
