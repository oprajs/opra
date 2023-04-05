import { UseGuards } from '@nestjs/common';
import { Collection } from '@opra/common';
import {
  CollectionCreateQuery, CollectionDeleteManyQuery, CollectionDeleteQuery,
  CollectionGetQuery, CollectionSearchQuery, CollectionUpdateManyQuery,
  CollectionUpdateQuery
} from '@opra/core';
import { Query } from '../../../../src/index.js';
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

  @Collection.SearchOperation()
  async search(@Query query: CollectionSearchQuery) {
    return this.photosService.search(query.filter);
  }

  @UseGuards(AuthGuard)
  @Collection.CreateOperation()
  create(@Query query: CollectionCreateQuery) {
    return this.photosService.create(query.data);
  }

  @Collection.GetOperation()
  get(@Query query: CollectionGetQuery) {
    return this.photosService.get(query.keyValue);
  }

  @Collection.UpdateOperation()
  update(@Query query: CollectionUpdateQuery) {
    return this.photosService.update(query.keyValue, query.data);
  }

  @Collection.UpdateManyOperation()
  async updateMany(@Query query: CollectionUpdateManyQuery) {
    return this.photosService.updateMany(query.data, query.filter);
  }

  @Collection.DeleteOperation()
  async delete(@Query query: CollectionDeleteQuery) {
    return this.photosService.delete(query.keyValue);
  }

  @Collection.DeleteManyOperation()
  async deleteMany(@Query query: CollectionDeleteManyQuery) {
    return this.photosService.deleteMany(query.filter);
  }

}
