import { Profile } from 'customer-mongo/models';
import { HttpController, HttpOperation } from '@opra/common';

@HttpController({
  description: 'My profile singleton',
})
export class MyProfileController {
  @HttpOperation.Entity.Get({ type: Profile })
  get() {
    //
  }
}
