import { HttpController, HttpOperation, OperationResult } from '@opra/common';
import { SqbClient } from '@sqb/connect';
import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Auth controller',
  controllers: [(parent: AuthController) => new MyProfileController(parent.db)],
  path: 'auth',
})
export class AuthController {
  constructor(readonly db: SqbClient) {}

  @HttpOperation({
    path: '/login',
  })
    .QueryParam('user', String)
    .QueryParam('password', 'string')
  login() {
    return new OperationResult({
      message: 'You are logged in',
    });
  }

  @HttpOperation({
    path: '/logout',
  })
  logout() {
    return new OperationResult({
      message: 'You are logged out',
    });
  }
}
