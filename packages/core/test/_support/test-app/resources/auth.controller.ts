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
      .Returns('any')
  login(ctx: Container.Action.Context) {
    return {user: ctx.request.params.user, token: '123456'}
  }

  @Container.Action()
  logout() {
    //
  }

  @Container
      .Action()
      .Returns('string')
  getToken() {
    return '123456'
  }

  @Container.Action()
      .Returns({contentType: 'text/plain'})
  getRawToken() {
    return '123456'
  }

}
