import {Module} from '@nestjs/common';
import {ExtendedModule} from './extended.module';
import {PhotoModule} from './photo/photo.module';

@Module({
  imports: [ExtendedModule.forRoot(), PhotoModule],
})
export class AsyncApplicationModule {
}
