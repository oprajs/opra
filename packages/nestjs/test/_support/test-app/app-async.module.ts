import {Module} from '@nestjs/common';
import {ExtendedModule} from './extended.module';
import options from './opra-options';
import {AirportsModule} from './svc1/airports/airports.module';

@Module({
  imports: [ExtendedModule.forRoot(options), AirportsModule],
})
export class AsyncApplicationModule {
}
