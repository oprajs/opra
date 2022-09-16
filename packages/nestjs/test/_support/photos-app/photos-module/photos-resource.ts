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
import { OpraSchema } from '@opra/schema/src/index';
import { Query } from '../../../../src/index.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { Customer } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@ApiEntityResource(Customer, {
  description: 'Photos resource'
})
export class PhotosResource implements IEntityResource {

  constructor(public photosService: PhotosService) {
  }

  async search(@Query query: SearchQuery): Promise<OpraSchema.EntitySearchResult> {
    return {items: this.photosService.search(query.filter), offset: 0};
  }

  @UseGuards(AuthGuard)
  create(@Query query: CreateQuery) {
    return this.photosService.create(query.data);
  }

  read(@Query query: ReadQuery) {
    return this.photosService.read(query.keyValue);
  }

  update(@Query query: UpdateQuery) {
    return this.photosService.update(query.keyValue, query.data);
  }

  async updateMany(@Query query: UpdateManyQuery) {
    return {affectedRecords: this.photosService.updateMany(query.data, query.filter)};
  }

  async delete(@Query query: DeleteQuery) {
    return {affectedRecords: this.photosService.delete(query.keyValue) ? 1 : 0};
  }

  async deleteMany(@Query query: DeleteManyQuery) {
    return {affectedRecords: this.photosService.deleteMany(query.filter)};
  }

}
