import { Storage } from '@opra/common';

@Storage({
  description: 'My files resource'
})
export class MyFilesController {

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
