import { HttpController, HttpOperation } from '@opra/common';
import { Profile } from '../entities/profile.entity.js';

@HttpController({
  description: 'My profile singleton',
})
export class MyProfileController {
  @HttpOperation.Entity.Get({ type: Profile })
  get() {
    //
  }
}
