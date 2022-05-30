import {Module} from '@nestjs/common';
import {OpraModule} from '@opra/nestjs';
import options from './opra-options';
import {AirportsModule} from './svc1/airports/airports.module';

@Module({
  imports: [
    OpraModule.forRootAsync({
      useFactory: async () => options,
    }),
    AirportsModule,
  ],
})
export class AsyncOptionsFactoryModule {
}
