import { UseGuards } from '@nestjs/common';
import { Singleton } from '@opra/common';
import { AuthGuard } from '../../guards/auth.guard.js';

@Singleton('object', {
  description: 'Profile resource'
})
@UseGuards(AuthGuard)
export class ProfileResource {

  constructor() {
  }

  @Singleton.Get()
  get() {
    return {user: 'john'};
  }

}
