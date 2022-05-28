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
  imports: [
    OpraModule.forRootAsync({
      useClass: ConfigService,
    }),
    PhotoModule,
  ],
})
export class AsyncOptionsClassModule {
}
