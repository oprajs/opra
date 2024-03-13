import { HttpAction, HttpResource } from '@opra/common';
import { MyProfileResource } from './my-profile.resource.js';

@HttpResource({
  description: 'Auth container',
  resources: [MyProfileResource]
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
