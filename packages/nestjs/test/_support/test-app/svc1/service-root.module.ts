import {Module} from '@nestjs/common';
import {AirportsModule} from './airports/airports.module';
import {CitiesModule} from './cities/cities.module';

@Module({
  imports: [AirportsModule, CitiesModule],
})
export class Service1RootModule {
}
