import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import { OpraModule } from '../../../src/index.js';
import { CatsResource } from './cats.resource.js';
import { CatsService } from './cats.service.js';
import { UsersService } from './users.service.js';

@Module({})
export class HelloModule {

  static forRoot(meta: Provider): DynamicModule {
    return {
      module: HelloModule,
      imports: [
        OpraModule.forRoot({
          providers: [
            meta, UsersService, CatsService, CatsResource,
            {
              provide: 'REQUEST_ID',
              useFactory: () => 1,
              scope: Scope.REQUEST,
            },
          ]
        }),
      ],
    };
  }
}
