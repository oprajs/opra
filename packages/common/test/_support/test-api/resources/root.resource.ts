import { ApiResource } from '@opra/common';
import { AuthController } from './auth.controller.js';
import { CountriesCollection } from './countries.collection.js';
import { CountriesResource } from './countries.resource.js';
import { CustomersCollection } from './customers.collection.js';
import { CustomersResource } from './customers.resource.js';

@ApiResource({
  description: 'Api root',
  resources: [
    AuthController,
    CountriesCollection, CountriesResource,
    CustomersCollection, CustomersResource
  ]
})
export class RootResource {

}
