import { ApiOperation, ApiResource } from '@opra/common';

@ApiResource({
  description: 'My files resource'
})
export class MyFilesResource {

  @ApiOperation.Multipart.Get()
  get() {
    //
  }

  @ApiOperation.Multipart.Post({})
  post() {
    //
  }

}
