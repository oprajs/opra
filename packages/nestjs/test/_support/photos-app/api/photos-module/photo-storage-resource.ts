import { Storage } from '@opra/common';

@Storage({
  description: 'Photos storage',
})
export class PhotoStorageResource {

  constructor() {
  }

  @Storage.Get()
  get() {
  }

  @Storage.Delete()
  async delete() {
    return true;
  }

  @Storage.Post()
  async post() {
    return 1;
  }

}
