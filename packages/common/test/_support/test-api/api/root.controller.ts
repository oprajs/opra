import { HttpResource } from '@opra/common';
import { AuthController } from './auth.controller.js';
import { CountriesController } from './countries.controller';
import { CountryController } from './country.controller';
import { CustomersController } from './customers.controller';
import { CustomerController } from './customer.controller';
import { MyFilesController } from './my-files.controller';
import { MyProfileController } from './my-profile.controller';

@HttpResource({
  description: 'Api root',
  resources: [
    AuthController,
    CountriesController, CountryController,
    CustomersController, CustomerController,
    MyFilesController, MyProfileController
  ]
})
export class RootController {

}
