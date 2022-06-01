import {Module} from '@nestjs/common';
import {OpraModule} from '../../../src';
import config from './opra-config.js';
import {Service1RootModule} from './svc1/service-root.module';

@Module({
  imports: [
    OpraModule.forRoot(config),
    Service1RootModule,
  ]
})
export class ApplicationModule {
}
