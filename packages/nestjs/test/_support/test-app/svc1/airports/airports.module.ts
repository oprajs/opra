import {Module} from '@nestjs/common';
import {AirportsController} from './airports.controller';
import {AirportsService} from './airports.service';

@Module({
  providers: [AirportsService],
  controllers: [AirportsController],
})
export class AirportsModule {
}
