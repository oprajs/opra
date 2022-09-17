import { UseGuards } from '@nestjs/common';
import {
  ApiEntityResource,
  CreateQuery,
  DeleteManyQuery,
  DeleteQuery, IEntityResource,
  ReadQuery,
  SearchQuery, UpdateManyQuery,
  UpdateQuery
} from '@opra/core';
import { Query } from '../../../../src/index.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@ApiEntityResource(Photos, {
  description: 'Photos resource'
})
export class PhotosResource implements IEntityResource<Photos> {

  constructor(public photosService: PhotosService) {
  }

  async search(@Query query: SearchQuery) {
    return this.photosService.search(query.filter);
  }

  async count(@Query query: SearchQuery) {
    return this.photosService.count(query.filter);
  }

  @UseGuards(AuthGuard)
  create(@Query query: CreateQuery) {
    return this.photosService.create(query.data);
  }

  get(@Query query: ReadQuery) {
    return this.photosService.get(query.keyValue);
  }

  update(@Query query: UpdateQuery) {
    return this.photosService.update(query.keyValue, query.data);
  }

  async updateMany(@Query query: UpdateManyQuery) {
    return this.photosService.updateMany(query.data, query.filter);
  }

  async delete(@Query query: DeleteQuery) {
    return this.photosService.delete(query.keyValue);
  }

  async deleteMany(@Query query: DeleteManyQuery) {
    return this.photosService.deleteMany(query.filter);
  }

}
