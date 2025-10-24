import { HttpController, HttpOperation } from '@opra/common';
import { Profile } from 'example-customer-mongo/models';

@HttpController({
  description: 'My profile singleton',
})
export class MyProfileController {
  @HttpOperation.Entity.Get({ type: Profile })
  get() {
    //
  }
}
