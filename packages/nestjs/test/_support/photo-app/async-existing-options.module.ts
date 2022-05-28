import {Module} from '@nestjs/common';
import {
  OpraModule,
  OpraModuleOptions,
  OpraModuleOptionsFactory,
} from '@opra/nestjs';
import {PhotoModule} from './photo/photo.module';

class ConfigService implements OpraModuleOptionsFactory {
  createOptions(): OpraModuleOptions {
    return {};
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
    PhotoModule,
  ]
})
export class AsyncOptionsExistingModule {
}
