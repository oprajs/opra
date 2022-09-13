import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service.js';
import { PhotosResource } from './photos-resource.js';

@Module({
  providers: [
    PhotosService, PhotosResource
  ]
})
export class PhotosModule {
}
