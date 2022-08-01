import {Module} from '@nestjs/common';
import {CountryModule} from './country/country.module.js';
import {CustomerModule} from './customer/customer.module.js';

@Module({
  imports: [
    CustomerModule,
    // CountryModule
  ],
})
export class Service1RootModule {
}
