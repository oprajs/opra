import {Module} from '@nestjs/common';
import {OpraModule} from '@opra/nestjs';
import {PhotoModule} from './photo/photo.module';

@Module({
  imports: [
    OpraModule.forRootAsync({
      useFactory: async () => ({}),
    }),
    PhotoModule,
  ],
})
export class AsyncOptionsFactoryModule {
}
