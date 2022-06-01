import {Module} from '@nestjs/common';
import {CustomerModule} from './customer/customer.module.js';
import {CountryModule} from './country/country.module.js';

@Module({
  imports: [CustomerModule, CountryModule],
})
export class Service1RootModule {
}
