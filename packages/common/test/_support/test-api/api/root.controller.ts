import { HttpController } from '@opra/common';
import { AuthController } from './auth.controller.js';
import { CountriesController } from './countries.controller.js';
import { CountryController } from './country.controller.js';
import { CustomerController } from './customer.controller.js';
import { CustomersController } from './customers.controller.js';
import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Api root',
  children: [
    AuthController,
    CountriesController,
    CountryController,
    CustomersController,
    CustomerController,
    MyProfileController,
  ],
})
export class RootController {}
