import {Module} from '@nestjs/common';
import {OpraModule} from '@opra/nestjs';
import config from './opra-config.js';
import {Service1RootModule} from './svc1/service-root.module.js';

@Module({
  imports: [
    OpraModule.forRoot(Service1RootModule, {
      ...config,
      name: 'service1',
      prefix: 'svc1'
    }),
  ],
})
export class ApplicationModule {
}
