import { UseGuards } from '@nestjs/common';
import {
  ApiEntityResource,
  OpraCreateQuery,
  OpraDeleteManyQuery,
  OpraDeleteQuery, OpraGetQuery,
  OpraSearchQuery, OpraUpdateManyQuery,
  OpraUpdateQuery
} from '@opra/core';
import { Query } from '../../../../src/index.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@ApiEntityResource(Photos, {
  description: 'Photos resource'
})
export class PhotosResource {

  constructor(public photosService: PhotosService) {
  }

  async search(@Query query: OpraSearchQuery) {
    return this.photosService.search(query.filter);
  }

  async count(@Query query: OpraSearchQuery) {
    return this.photosService.count(query.filter);
  }

  @UseGuards(AuthGuard)
  create(@Query query: OpraCreateQuery) {
    return this.photosService.create(query.data);
  }

  get(@Query query: OpraGetQuery) {
    return this.photosService.get(query.keyValue);
  }

  update(@Query query: OpraUpdateQuery) {
    return this.photosService.update(query.keyValue, query.data);
  }

  async updateMany(@Query query: OpraUpdateManyQuery) {
    return this.photosService.updateMany(query.data, query.filter);
  }

  async delete(@Query query: OpraDeleteQuery) {
    return this.photosService.delete(query.keyValue);
  }

  async deleteMany(@Query query: OpraDeleteManyQuery) {
    return this.photosService.deleteMany(query.filter);
  }

}
