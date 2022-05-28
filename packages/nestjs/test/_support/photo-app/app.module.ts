import {Module} from '@nestjs/common';
import {OpraModule} from '@opra/nestjs';
import {PhotoModule} from './photo/photo.module';

@Module({
  imports: [
    OpraModule.forRoot(),
    PhotoModule
  ]
})
export class ApplicationModule {
}
