import { Container } from '@opra/common';
import { MyProfileResource } from './my-profile.resource.js';

@Container({
  description: 'Auth container',
  resources: [MyProfileResource]
})
export class AuthController {

  @Container.Action()
      .Parameter('user', String)
      .Parameter('password', 'string')
  login() {
    //
  }

  @Container.Action()
  logout() {
    //
  }

}
