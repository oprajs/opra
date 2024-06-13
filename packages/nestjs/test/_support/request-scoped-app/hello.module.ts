import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import { OpraHttpModule } from '../../../src/index.js';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';
import { UsersService } from './users.service.js';

@Module({})
export class HelloModule {
  static forRoot(meta: Provider): DynamicModule {
    return {
      module: HelloModule,
      imports: [
        OpraHttpModule.forRoot({
          name: 'CatsApi',
          controllers: [CatsController],
          providers: [
            meta,
            UsersService,
            CatsService,
            {
              provide: 'REQUEST_ID',
              useFactory: () => 1,
              scope: Scope.REQUEST,
            },
          ],
        }),
      ],
    };
  }
}
