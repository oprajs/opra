import { Module } from '@nestjs/common';
import { Container } from '@opra/common';
import { Context } from '@opra/nestjs';
import { AvatarResource } from './avatar-resource.js';
import { ProfileResource } from './profile-resource.js';

@Module({
  providers: [
    AvatarResource,
    ProfileResource
  ]
})
@Container({name: 'auth', description: 'Authorization module'})
export class AuthModule {

  @Container.Action()
      .Parameter('user')
  async login(@Context ctx: Container.Action.Context) {
    return {user: ctx.request.params.user};
  }

}
