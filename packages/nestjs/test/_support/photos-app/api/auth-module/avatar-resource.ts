import { UseGuards } from '@nestjs/common';
import { Storage } from '@opra/common';
import { AuthGuard } from '../../guards/auth.guard.js';

@Storage({
  description: 'Avatar resource'
})
@UseGuards(AuthGuard)
export class AvatarResource {

  constructor() {
  }

  @Storage.Get()
  get() {
    return Buffer.from('12345');
  }

  @Storage.Delete()
  delete() {
    return true;
  }

  @Storage.Post()
  post() {
    return true;
  }

}
