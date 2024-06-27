import { Db } from 'mongodb';
import { HttpController, HttpOperation, OperationResult } from '@opra/common';
import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Auth controller',
  controllers: [(parent: AuthController) => new MyProfileController(parent.db)],
  path: 'auth',
})
export class AuthController {
  constructor(readonly db: Db) {}

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
