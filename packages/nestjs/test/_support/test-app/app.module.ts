import filedirname from 'filedirname'
import path from 'path';
import {Module} from '@nestjs/common';
import {OpraModule} from '../../../src';
import {Service1RootModule} from './svc1/service-root.module';

@Module({
  imports: [
    OpraModule.forRoot({
      servicePrefix: 'res',
      i18n: {
        resourceDirs: [path.join(filedirname()[1], 'locale')]
      }
    }),
    Service1RootModule,
  ]
})
export class ApplicationModule {
}
