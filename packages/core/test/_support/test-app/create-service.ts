import { OpraService } from '@opra/schema';
import { Country } from './entities/country.entity.js';
import { countriesResource } from './resource/countries.resource.js';
import { CustomerNotesResource } from './resource/customer-notes.resource.js';
import { CustomersResource } from './resource/customers.resource.js';

export async function createTestService() {
  return OpraService.create({
    info: {
      title: 'TestApi',
      version: 'v1',
    },
    types: [Country],
    resources: [countriesResource, new CustomersResource(), new CustomerNotesResource()]
  });
}
