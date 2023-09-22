import { Singleton } from '@opra/common';
import { Profile } from '../entities/profile.entity.js';

@Singleton(Profile, {
  description: 'My profile resource'
})
export class MyProfileController {

  @Singleton.Get()
  get() {
    //
  }

}
