import { ApiOperation, ApiResource } from '@opra/common';
import { Profile } from '../entities/profile.entity.js';

@ApiResource({
  description: 'My profile singleton'
})
export class MyProfileResource {

  @ApiOperation.Entity.FindOne(Profile)
  get() {
    //
  }

}
