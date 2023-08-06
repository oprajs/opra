import { UseGuards } from '@nestjs/common';
import { Collection } from '@opra/common';
import { OperationContext } from '@opra/core';
import { Context } from '@opra/nestjs';
import { AuthGuard } from '../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@Collection(Photos, {
  description: 'Photos resource',
  primaryKey: 'id'
})
export class PhotosResource {

  constructor(public photosService: PhotosService) {
  }

  @Collection.FindMany()
  async search(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.search(request.args.filter);
  }

  @UseGuards(AuthGuard)
  @Collection.Create()
  create(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.create(request.args.data);
  }

  @Collection.Get()
  get(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.get(request.args.key);
  }

  @Collection.Update()
  update(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.update(request.args.key, request.args.data);
  }

  @Collection.UpdateMany()
  async updateMany(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.updateMany(request.args.data, request.args.filter);
  }

  @Collection.Delete()
  async delete(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.delete(request.args.key);
  }

  @Collection.DeleteMany()
  async deleteMany(@Context ctx: OperationContext) {
    const {request} = ctx;
    return this.photosService.deleteMany(request.args.filter);
  }

}
