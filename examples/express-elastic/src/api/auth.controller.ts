import { Client } from '@elastic/elasticsearch';
import { HttpController, HttpOperation, OperationResult } from '@opra/common';
// import { MyProfileController } from './my-profile.controller.js';

@HttpController({
  description: 'Auth controller',
  // controllers: [(parent: AuthController) => new MyProfileController(parent.client)],
  path: 'auth',
})
export class AuthController {
  constructor(readonly client: Client) {}

  @(HttpOperation({
    path: 'login',
  })
    .QueryParam('user', String)
    .QueryParam('password', 'string')
    .Response(200, { type: OperationResult }))
  login() {
    return new OperationResult({
      message: 'You are logged in',
    });
  }

  @(HttpOperation({
    path: '/logout',
  }).Response(200, { type: OperationResult }))
  logout() {
    return new OperationResult({
      message: 'You are logged out',
    });
  }
}
