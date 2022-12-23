import { UseGuards } from '@nestjs/common';
import {
  CollectionCountQuery,
  CollectionCreateQuery,
  CollectionDeleteQuery,
  CollectionGetQuery,
  CollectionSearchQuery,
  CollectionUpdateManyQuery,
  CollectionUpdateQuery,
  OprCollectionResource
} from '@opra/common';
import { Query } from '../../../../src/index.js';
import { AuthGuard } from '../guards/auth.guard.js';
import { Photos } from './photos.dto.js';
import { PhotosService } from './photos.service.js';

@OprCollectionResource(Photos, {
  description: 'Photos resource',
  keyFields: 'id'
})
export class PhotosResource {

  constructor(public photosService: PhotosService) {
  }

  async search(@Query query: CollectionSearchQuery) {
    return this.photosService.search(query.filter);
  }

  async count(@Query query: CollectionCountQuery) {
    return this.photosService.count(query.filter);
  }

  @UseGuards(AuthGuard)
  create(@Query query: CollectionCreateQuery) {
    return this.photosService.create(query.data);
  }

  get(@Query query: CollectionGetQuery) {
    return this.photosService.get(query.keyValue);
  }

  update(@Query query: CollectionUpdateQuery) {
    return this.photosService.update(query.keyValue, query.data);
  }

  async updateMany(@Query query: CollectionUpdateManyQuery) {
    return this.photosService.updateMany(query.data, query.filter);
  }

  async delete(@Query query: CollectionDeleteQuery) {
    return this.photosService.delete(query.keyValue);
  }

  async deleteMany(@Query query: CollectionUpdateManyQuery) {
    return this.photosService.deleteMany(query.filter);
  }

}
