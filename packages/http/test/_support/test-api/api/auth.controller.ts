import '../../../../src/index.js';
import {
  ApiField,
  ComplexType,
  HttpController,
  HttpOperation,
} from '@opra/common';
import { HttpContext } from '@opra/http';
import { MyProfileController } from './my-profile.controller.js';

@ComplexType()
class LoginResult {
  @ApiField()
  declare user: string;

  @ApiField()
  declare token: string;
}

@(HttpController({
  description: 'Auth container',
  resources: [MyProfileController],
}).UseType(LoginResult))
export class AuthController {
  @(HttpOperation({ path: '/login' })
    .QueryParam('user', String)
    .QueryParam('password', 'string')
    .Response(200, { type: LoginResult }))
  login(ctx: HttpContext) {
    return { user: ctx.queryParams.user, token: '123456' };
  }

  @HttpOperation({ path: '/logout' })
  logout() {
    //
  }

  @(HttpOperation({ path: '/getToken' }).Response(200, { type: String }))
  getToken() {
    return '123456';
  }

  @(HttpOperation({ path: '/getRawToken' }).Response(200, {
    contentType: 'text/plain',
  }))
  getRawToken() {
    return '123456';
  }
}
