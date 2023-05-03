import { Singleton } from '@opra/common';
import { Profile } from '../entities/profile.entity.js';

@Singleton(Profile, {
  description: 'My profile resource'
})
export class MyProfileResource {

  @Singleton.Get()
  get() {
    //
  }

}
