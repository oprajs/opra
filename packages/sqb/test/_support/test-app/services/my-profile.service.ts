import { SqbSingletonService } from '@opra/sqb';
import { Profile } from '../entities/profile.entity.js';

let idGen = 1001;

export class MyProfileService extends SqbSingletonService<Profile> {
  constructor(options?: SqbSingletonService.Options) {
    super(Profile, {
      id: 1,
      ...options,
      interceptor: (callback, args) => {
        if (args.crud === 'create') args.input!._id = idGen++;
        return callback();
      },
    });
  }
}
