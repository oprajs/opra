import '@opra/core';
import {
  Singleton,
} from '@opra/common';
import { Profile } from '@opra/common/test/_support/test-api';

@Singleton(Profile, {
  description: 'Best Customer resource'
})
export class MyProfileResource {

  @Singleton.Create()
  create() {
    //
  }

  @Singleton.Delete()
  delete() {
    //
  }

  @Singleton.Get()
  get() {
    //
  }

  @Singleton.Update()
  update() {
    //
  }

}
