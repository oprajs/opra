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
import { Customer } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@ApiEntityResource(Customer, {
  description: 'Photos resource'
})
export class PhotosResource implements IEntityResource {

  constructor(public photosService: PhotosService) {
  }

  search(@Query query: SearchQuery) {
    return this.photosService.search(query.filter);
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

  updateMany(@Query query: UpdateManyQuery) {
    return this.photosService.updateMany(query.data, query.filter);
  }

  delete(@Query query: DeleteQuery) {
    return this.photosService.delete(query.keyValue);
  }

  deleteMany(@Query query: DeleteManyQuery) {
    return this.photosService.deleteMany(query.filter);
  }

}
