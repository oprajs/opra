import { Module } from '@nestjs/common';
import { PhotoStorageResource } from './photo-storage-resource.js';
import { PhotosService } from './photos.service.js';
import { PhotosResource } from './photos-resource.js';

@Module({
  providers: [
    PhotosService, PhotosResource, PhotoStorageResource
  ]
})
export class PhotosModule {
}
