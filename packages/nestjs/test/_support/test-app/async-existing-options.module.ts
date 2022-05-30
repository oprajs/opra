import {Module} from '@nestjs/common';
import {
  OpraModule,
  OpraModuleOptions,
  OpraModuleOptionsFactory,
} from '@opra/nestjs';
import options from './opra-options';
import {AirportsModule} from './svc1/airports/airports.module';

class ConfigService implements OpraModuleOptionsFactory {
  createOptions(): OpraModuleOptions {
    return options;
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {
}

@Module({
  imports: [
    OpraModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
    AirportsModule,
  ]
})
export class AsyncOptionsExistingModule {
}
