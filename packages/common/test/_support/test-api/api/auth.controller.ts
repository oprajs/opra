import { HttpAction, HttpResource } from '@opra/common';
import { MyProfileController } from './my-profile.controller.js';

@HttpResource({
  description: 'Auth container',
  resources: [MyProfileController]
})
export class AuthController {

  @HttpAction()
      .Parameter('user', String)
      .Parameter('password', 'string')
  login() {
    //
  }

  @HttpAction()
  logout() {
    //
  }

}
