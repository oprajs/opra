import { ApiAction, ApiResource } from '@opra/common';
import { MyProfileResource } from './my-profile.resource.js';

@ApiResource({
  description: 'Auth container',
  resources: [MyProfileResource]
})
export class AuthController {

  @ApiAction()
      .Parameter('user', String)
      .Parameter('password', 'string')
  login() {
    //
  }

  @ApiAction()
  logout() {
    //
  }

}
