import { Storage } from '@opra/common';

@Storage({
  description: 'My files resource'
})
export class MyFilesResource {

  @Storage.Get()
  get() {
    //
  }

  @Storage.Post({

  })
  post() {
    //
  }

}
