import { HttpOperation, HttpResource } from '@opra/common';
import { Profile } from '../entities/profile.entity.js';

@HttpResource({
  description: 'My profile singleton'
})
export class MyProfileResource {

  @HttpOperation.Entity.Get(Profile, 'id')
  get() {
    //
  }

}
