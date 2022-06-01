import {Module} from '@nestjs/common';
import {CountryController} from './country.controller.js';
import {CountryService} from './country.service.js';

@Module({
  providers: [CountryService],
  controllers: [CountryController],
})
export class CountryModule {
}
