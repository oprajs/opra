import { Container } from '@opra/common';
import { MyProfileController } from './my-profile.controller.js';

@Container({
  'description': 'Auth container',
  resources: [MyProfileController]
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
