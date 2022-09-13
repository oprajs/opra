import { Module } from '@nestjs/common';
import { PhotosModule } from './photos-module/photos.module.js';

@Module({
  imports: [
    PhotosModule
  ],
})
export class Service1RootModule {
}
