import { OpraService } from '../../../src/index.js';
import { countriesResource } from './api/countries.resource.js';
import { CustomerAddressesesResource } from './api/customer-addresseses.resource.js';
import { CustomersResource } from './api/customers.resource.js';
import { Customer } from './dto/customer.dto.js';

export async function createTestService() {
  return OpraService.create({
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    types: [Customer],
    resources: [countriesResource, new CustomersResource(), new CustomerAddressesesResource()]
  });
}
