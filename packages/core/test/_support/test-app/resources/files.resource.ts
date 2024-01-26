import '@opra/core';
import { Storage } from '@opra/common';
import { Note } from '../types/note.type.js';

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
  async delete() {
    return true;
  }

  @Storage.Post()
      .Returns(Note)
  async post(context: Storage.Post.Context) {
    FilesResource.lastPost = await context.request.parts.getAll();
    return new Note({
      title: 'title',
      text: 'text'
    });
  }

  @Storage.Action()
      .Parameter('silent', Boolean)
  async purge() {
    return {done: true}
  }

}
