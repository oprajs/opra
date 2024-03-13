import { HttpResource } from '@opra/common';
import { AuthController } from './auth.controller.js';
import { CountriesCollection } from './countries.collection.js';
import { CountriesResource } from './countries.resource.js';
import { CustomersCollection } from './customers.collection.js';
import { CustomersResource } from './customers.resource.js';
import { MyFilesResource } from './my-files.resource.js';
import { MyProfileResource } from './my-profile.resource.js';

@HttpResource({
  description: 'Api root',
  resources: [
    AuthController,
    CountriesCollection, CountriesResource,
    CustomersCollection, CustomersResource,
    MyFilesResource, MyProfileResource
  ]
})
export class RootResource {

}
