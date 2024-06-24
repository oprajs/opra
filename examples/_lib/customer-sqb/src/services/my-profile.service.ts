import { SqbSingletonService } from '@opra/sqb';
import { Profile } from '../models/index.js';

export class MyProfileService extends SqbSingletonService<Profile> {
  constructor(options?: SqbSingletonService.Options) {
    super(Profile, {
      id: 1,
      ...options,
    });
  }
}
