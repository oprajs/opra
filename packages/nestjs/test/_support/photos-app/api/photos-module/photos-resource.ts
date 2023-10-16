import { UseGuards } from '@nestjs/common';
import { Collection } from '@opra/common';
import { Context } from '@opra/nestjs';
import { AuthGuard } from '../../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@Collection(Photos, {
  description: 'Photos resource',
  primaryKey: 'id'
})
export class PhotosResource {

  constructor(public photosService: PhotosService) {
  }

  @Collection.Action({returnType: 'object'})
  sendMessage(@Context ctx: Collection.Action.Context) {
    return {ok: true, message: ctx.request.params.message};
  }

  @Collection.FindMany({
    filters: [
      {field: 'id', operators: ['=', '<', '>', '>=', '<=', '!=']}
    ]
  })
  async findMany(@Context ctx: Collection.FindMany.Context) {
    const {request} = ctx;
    return this.photosService.search(request.params.filter);
  }

  @UseGuards(AuthGuard)
  @Collection.Create()
  create(@Context ctx: Collection.Create.Context) {
    const {request} = ctx;
    return this.photosService.create(request.data);
  }

  @Collection.Get()
  get(@Context ctx: Collection.Get.Context) {
    const {request} = ctx;
    return this.photosService.get(request.key);
  }

  @Collection.Update()
  update(@Context ctx: Collection.Update.Context) {
    const {request} = ctx;
    return this.photosService.update(request.key, request.data);
  }

  @Collection.UpdateMany()
  async updateMany(@Context ctx: Collection.UpdateMany.Context) {
    const {request} = ctx;
    return this.photosService.updateMany(request.data, request.params.filter);
  }

  @Collection.Delete()
  async delete(@Context ctx: Collection.Delete.Context) {
    const {request} = ctx;
    return this.photosService.delete(request.key);
  }

  @Collection.DeleteMany()
  async deleteMany(@Context ctx: Collection.DeleteMany.Context) {
    const {request} = ctx;
    return this.photosService.deleteMany(request.params.filter);
  }

}
