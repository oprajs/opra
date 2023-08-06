import '@opra/core';
import { Storage } from '@opra/common';

@Storage({
  description: 'Best Customer resource'
})
export class FilesResource {
  static lastPost: any;

  @Storage.Get()
  async get(context: Storage.Get.Context) {
    const http = context.request.switchToHttp();
    const requestedFile = http.parsedUrl.path[1].resource;
    return {
      fileName: requestedFile
    }
  }

  @Storage.Delete()
  async delete(context: Storage.Delete.Context) {
    const http = context.request.switchToHttp();
    const requestedFile = http.parsedUrl.path[1].resource;
    return {
      deleted: requestedFile
    }
  }

  @Storage.Post()
  async post(context: Storage.Post.Context) {
    FilesResource.lastPost = await context.request.parts.getAll();
  }

}
