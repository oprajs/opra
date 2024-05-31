import { HttpController, HttpOperation } from '@opra/common';
import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Auth controller',
  children: [MyProfileController],
})
export class AuthController {
  @HttpOperation({
    path: 'login',
  })
    .QueryParam('user', String)
    .QueryParam('password', 'string')
  login() {
    //
  }

  @HttpOperation({
    path: 'logout',
  })
  logout() {
    //
  }
}
